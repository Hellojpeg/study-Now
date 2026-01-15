import React, { useState, useEffect, useRef } from 'react';
import { Question, TDEnemy, TDTower, TowerType } from '../types';
import { ArrowLeft, Shield, Zap, Coins, Heart, Play, AlertTriangle, BookOpen, Skull, Swords, Maximize, Target, Activity, Lock, Unlock, Hammer } from 'lucide-react';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface TowerDefenseGameProps {
  questions: Question[];
  onExit: () => void;
}

// --- CONFIGURATION ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PATH_WIDTH = 40;   

// Defined Path (Simplified S-Curve)
const PATH_POINTS = [
  {x: 0, y: 100}, {x: 200, y: 100}, {x: 200, y: 500}, 
  {x: 600, y: 500}, {x: 600, y: 200}, {x: 800, y: 200}
];

// --- 14 TOWER DEFINITIONS ---
// Reduced initial ranges to emphasize skill tree upgrades
const TOWER_DEFINITIONS: Record<TowerType, { name: string, cost: number, range: number, damage: number, cooldown: number, energy: number, color: string, unlockWave: number }> = {
    PEASANT: { name: 'Peasant', cost: 30, range: 60, damage: 2, cooldown: 1000, energy: 0, color: 'bg-stone-400', unlockWave: 0 },
    ARCHER: { name: 'Archer', cost: 50, range: 90, damage: 5, cooldown: 800, energy: 1, color: 'bg-blue-500', unlockWave: 0 },
    SNIPER: { name: 'Sniper', cost: 100, range: 200, damage: 20, cooldown: 2000, energy: 2, color: 'bg-slate-700', unlockWave: 2 },
    MAGE: { name: 'Mage', cost: 120, range: 80, damage: 8, cooldown: 1200, energy: 2, color: 'bg-purple-600', unlockWave: 3 }, // Splash
    ICE: { name: 'Ice', cost: 80, range: 70, damage: 2, cooldown: 500, energy: 1, color: 'bg-cyan-300', unlockWave: 4 }, // Slow
    CANNON: { name: 'Cannon', cost: 150, range: 90, damage: 30, cooldown: 2500, energy: 3, color: 'bg-red-700', unlockWave: 5 }, // Splash
    TESLA: { name: 'Tesla', cost: 180, range: 80, damage: 5, cooldown: 200, energy: 3, color: 'bg-yellow-400', unlockWave: 6 }, // Chain
    POISON: { name: 'Poison', cost: 110, range: 80, damage: 3, cooldown: 1000, energy: 1, color: 'bg-green-600', unlockWave: 7 }, // Dot
    MINIGUN: { name: 'Minigun', cost: 250, range: 100, damage: 3, cooldown: 100, energy: 5, color: 'bg-orange-500', unlockWave: 8 },
    LASER: { name: 'Laser', cost: 300, range: 250, damage: 1, cooldown: 50, energy: 6, color: 'bg-pink-500', unlockWave: 9 }, // Constant
    MORTAR: { name: 'Mortar', cost: 200, range: 300, damage: 50, cooldown: 4000, energy: 4, color: 'bg-stone-700', unlockWave: 10 },
    SONIC: { name: 'Sonic', cost: 140, range: 60, damage: 10, cooldown: 1500, energy: 2, color: 'bg-indigo-400', unlockWave: 11 }, // Stun
    PLASMA: { name: 'Plasma', cost: 400, range: 120, damage: 100, cooldown: 3000, energy: 8, color: 'bg-violet-600', unlockWave: 12 },
    VOID: { name: 'Void', cost: 1000, range: 400, damage: 999, cooldown: 10000, energy: 20, color: 'bg-black', unlockWave: 15 }
};

type WaveType = 'NORMAL' | 'FRENZY' | 'BOSS';

const TowerDefenseGame: React.FC<TowerDefenseGameProps> = ({ questions, onExit }) => {
  // Resources
  const [gold, setGold] = useState(100); 
  const [knowledge, setKnowledge] = useState(100); // UPKEEP RESOURCE
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(1);
  const [skillPoints, setSkillPoints] = useState(0);
  
  // Entities
  const [enemies, setEnemies] = useState<TDEnemy[]>([]);
  const [towers, setTowers] = useState<TDTower[]>([]);
  const [projectiles, setProjectiles] = useState<{id: number, x: number, y: number, tx: number, ty: number, speed: number}[]>([]);
  
  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'BUILD' | 'WAVE' | 'REVIVE' | 'GAME_OVER' | 'SKILLS'>('BUILD');
  const [isUpkeepFailing, setIsUpkeepFailing] = useState(false);
  
  // Wave Management
  const [waveDuration, setWaveDuration] = useState(0); 
  const [waveTimeElapsed, setWaveTimeElapsed] = useState(0); 
  const [lastSpawnTime, setLastSpawnTime] = useState(0);
  const [currentWaveType, setCurrentWaveType] = useState<WaveType>('NORMAL');

  // Placement State
  const [placementMode, setPlacementMode] = useState<TowerType | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isValidPlacement, setIsValidPlacement] = useState(false);

  // Skill Tree State
  const [skills, setSkills] = useState({
      range: 0, // Tree A
      damage: 0, // Tree A
      efficiency: 0, // Tree B (Energy Cost reduction)
      greed: 0 // Tree B (Gold Gain)
  });

  // Modal State
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaReason, setTriviaReason] = useState<'GOLD' | 'KNOWLEDGE' | 'REVIVE'>('KNOWLEDGE');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Added initial values for useRef to fix "Expected 1 arguments, but got 0"
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const lastUpkeepTickRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- STATS CALCULATION ---
  const getTowerStats = (type: TowerType) => {
      const def = TOWER_DEFINITIONS[type];
      return {
          ...def,
          range: def.range * (1 + (skills.range * 0.1)), // 10% per level
          damage: def.damage * (1 + (skills.damage * 0.1)),
          energyCost: Math.max(0, def.energy - skills.efficiency)
      };
  };

  const getMaxTowers = () => 4 + Math.floor(wave / 2);

  // --- GAME LOOP ---
  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;

      // UPKEEP LOGIC (Runs always during play)
      // Drains every 1 second instead of 2 for higher pressure
      if (phase === 'WAVE' || phase === 'BUILD') {
          if (time - lastUpkeepTickRef.current > 1000) { 
              setKnowledge(prev => {
                  const decay = Math.floor(2 + (towers.length * 1)); // Base decay 2 + 1 per tower
                  const newVal = Math.max(0, prev - decay);
                  setIsUpkeepFailing(newVal === 0);
                  return newVal;
              });
              lastUpkeepTickRef.current = time;
          }
      }

      if (phase === 'WAVE' && isPlaying) {
        setWaveTimeElapsed(prev => prev + deltaTime);

        // 1. Spawning Logic
        const config = getWaveConfig(wave);
        if (waveTimeElapsed < config.duration && time - lastSpawnTime > config.spawnInterval) {
            spawnEnemy(config.type);
            setLastSpawnTime(time);
        }
        if (config.type === 'BOSS' && waveTimeElapsed < 100 && !enemies.some(e => e.isBoss)) {
             spawnBoss();
        }
        if (waveTimeElapsed > config.duration && enemies.length === 0) {
            endWave();
        }

        // 2. Move Enemies
        setEnemies(prev => {
            const next: TDEnemy[] = [];
            prev.forEach(e => {
                let nextIdx = e.pathIndex;
                let target = PATH_POINTS[Math.min(nextIdx + 1, PATH_POINTS.length - 1)];
                if (!target) return;
                
                const dx = target.x - e.x;
                const dy = target.y - e.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 5) {
                    if (nextIdx >= PATH_POINTS.length - 2) {
                        setLives(l => Math.max(0, l - (e.isBoss ? 10 : 1)));
                        return;
                    }
                    e.pathIndex++;
                } else {
                    e.x += (dx/dist) * e.speed;
                    e.y += (dy/dist) * e.speed;
                }
                next.push(e);
            });
            return next;
        });

        // Fixed redundant type comparison warning: narrowing phase to 'WAVE' makes phase !== 'REVIVE' redundant
        if (lives <= 0) {
            setPhase('REVIVE');
            setIsPlaying(false);
            openTrivia('REVIVE');
        }

        // 3. Towers Shoot (Only if Knowledge > 0)
        if (knowledge > 0) {
            setTowers(prev => prev.map(t => {
                const stats = getTowerStats(t.type);
                if (time - t.lastShot > stats.cooldown) {
                    const target = enemies.find(e => Math.sqrt((e.x-t.x)**2 + (e.y-t.y)**2) <= stats.range);
                    if (target) {
                        fireProjectile(t, target);
                        damageEnemy(target.id, stats.damage);
                        // Instant upkeep cost for firing powerful towers
                        if (stats.energyCost > 0) setKnowledge(k => Math.max(0, k - 1)); 
                        return { ...t, lastShot: time };
                    }
                }
                return t;
            }));
        }

        // 4. Projectiles
        setProjectiles(prev => prev.map(p => {
            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 10) return null;
            return { ...p, x: p.x + (dx/dist)*p.speed, y: p.y + (dy/dist)*p.speed };
        }).filter(Boolean) as any);
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [phase, isPlaying, enemies, lives, knowledge, towers]);

  // --- WAVE CONFIG ---
  const getWaveConfig = (n: number) => {
      const type: WaveType = n % 10 === 0 ? 'BOSS' : n % 4 === 0 ? 'FRENZY' : 'NORMAL';
      let duration = Math.min(90000, 20000 + (n * 3000));
      let spawnInterval = Math.max(500, 2500 - (n * 150));
      
      if (type === 'FRENZY') { spawnInterval = 600; duration = 20000; }
      if (type === 'BOSS') { spawnInterval = 3000; duration = 30000; }
      return { type, duration, spawnInterval };
  };

  const spawnEnemy = (type: WaveType) => {
      const hp = 20 * Math.pow(1.2, wave); // Exponential difficulty
      const speed = 1 + (wave * 0.1);
      setEnemies(prev => [...prev, { id: Math.random().toString(), x: PATH_POINTS[0].x, y: PATH_POINTS[0].y, hp, maxHp: hp, speed, pathIndex: 0, isBoss: false }]);
  };

  const spawnBoss = () => {
      const hp = 500 * Math.pow(1.3, wave);
      setEnemies(prev => [...prev, { id: Math.random().toString(), x: PATH_POINTS[0].x, y: PATH_POINTS[0].y, hp, maxHp: hp, speed: 0.5, pathIndex: 0, isBoss: true }]);
  };

  const damageEnemy = (id: string, dmg: number) => {
      setEnemies(prev => prev.map(e => e.id === id ? { ...e, hp: e.hp - dmg } : e).filter(e => {
          if (e.hp - dmg <= 0) {
              const goldGain = (e.isBoss ? 200 : 15) * (1 + skills.greed * 0.2);
              setGold(g => Math.floor(g + goldGain));
              return false;
          }
          return true;
      }));
  };

  const fireProjectile = (tower: TDTower, target: TDEnemy) => {
      setProjectiles(prev => [...prev, { id: Math.random(), x: tower.x, y: tower.y, tx: target.x, ty: target.y, speed: 20 }]);
  };

  const endWave = () => {
      setPhase('BUILD');
      setWave(w => w + 1);
      setSkillPoints(s => s + 1);
      playSuccessSound();
  };

  // --- INPUT & TRIVIA ---
  const handleCanvasClick = () => {
      if (!placementMode || !isValidPlacement) { setPlacementMode(null); return; }
      if (towers.length >= getMaxTowers()) { alert("Tower Limit Reached!"); return; }
      
      const stats = TOWER_DEFINITIONS[placementMode];
      if (gold >= stats.cost) {
          setGold(g => g - stats.cost);
          setTowers(prev => [...prev, {
              id: Math.random().toString(), x: mousePos.x, y: mousePos.y, type: placementMode,
              range: stats.range, damage: stats.damage, cooldown: stats.cooldown, energyCost: stats.energy, lastShot: 0
          }]);
          playSuccessSound();
          setPlacementMode(null);
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!placementMode || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
      
      // Simple validity check
      let valid = x > 20 && x < CANVAS_WIDTH - 20 && y > 20 && y < CANVAS_HEIGHT - 20;
      // Check path collision (simplified)
      // Check tower overlap
      towers.forEach(t => { if (Math.hypot(t.x - x, t.y - y) < 40) valid = false; });
      setIsValidPlacement(valid);
  };

  const openTrivia = (reason: 'GOLD' | 'KNOWLEDGE' | 'REVIVE') => {
      setTriviaReason(reason);
      setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
      setShowTrivia(true);
      setIsPlaying(false);
  };

  const handleTriviaAnswer = (isCorrect: boolean) => {
      if (isCorrect) {
          playSuccessSound();
          if (triviaReason === 'GOLD') setGold(g => g + 150);
          if (triviaReason === 'KNOWLEDGE') setKnowledge(prev => Math.min(100, prev + 50));
          if (triviaReason === 'REVIVE') { setLives(5); setEnemies([]); setPhase('BUILD'); }
      } else {
          playFailureSound();
          if (triviaReason === 'REVIVE') setPhase('GAME_OVER');
      }
      setShowTrivia(false);
      if (phase === 'WAVE') setIsPlaying(true);
  };

  const upgradeSkill = (tree: 'A' | 'B', skill: string) => {
      if (skillPoints > 0) {
          setSkillPoints(s => s - 1);
          setSkills(prev => ({ ...prev, [skill]: (prev as any)[skill] + 1 }));
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans flex flex-col items-center">
        {/* HUD */}
        <div className="w-full max-w-6xl bg-slate-800 p-4 rounded-2xl mb-4 flex justify-between items-center shadow-lg border border-slate-700">
            <button onClick={onExit}><ArrowLeft className="w-6 h-6 text-slate-400"/></button>
            <div className="flex gap-6 text-sm md:text-base font-bold">
                <div className="flex items-center gap-2 text-yellow-400"><Coins className="w-5 h-5"/> {gold}</div>
                <div className="flex items-center gap-2 text-red-400"><Heart className="w-5 h-5"/> {lives}</div>
                <div className="flex items-center gap-2 text-blue-400 cursor-pointer hover:scale-110 transition-transform" onClick={() => openTrivia('KNOWLEDGE')}>
                    <Zap className={`w-5 h-5 ${isUpkeepFailing ? 'text-red-500 animate-bounce' : ''}`}/> 
                    {knowledge}% <span className="text-xs opacity-50 ml-1">(Click to Charge)</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400"><Shield className="w-5 h-5"/> {towers.length}/{getMaxTowers()}</div>
                <div className="flex items-center gap-2 text-emerald-400 cursor-pointer" onClick={() => setPhase('SKILLS')}><Hammer className="w-5 h-5"/> SP: {skillPoints}</div>
            </div>
            {phase === 'BUILD' ? (
                <button onClick={() => { setPhase('WAVE'); setIsPlaying(true); }} className="bg-emerald-600 px-6 py-2 rounded-lg font-bold animate-pulse">Start Wave {wave}</button>
            ) : (
                <div className="text-slate-500 font-mono">WAVE {wave} IN PROGRESS</div>
            )}
        </div>

        {/* GAME AREA */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            {/* Interactive Layer */}
            <div ref={containerRef} className="absolute inset-0 z-10" onMouseMove={handleMouseMove} onClick={handleCanvasClick}>
                {placementMode && (
                    <div className={`absolute w-10 h-10 rounded-full border-2 -ml-5 -mt-5 flex items-center justify-center ${isValidPlacement ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'}`} style={{ left: mousePos.x, top: mousePos.y }}>
                        <div className="absolute rounded-full border border-white/20" style={{ width: getTowerStats(placementMode).range * 2, height: getTowerStats(placementMode).range * 2 }} />
                    </div>
                )}
            </div>

            {/* Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30"><polyline points={PATH_POINTS.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="white" strokeWidth={PATH_WIDTH} strokeLinecap="round" strokeLinejoin="round" /></svg>

            {/* Entities */}
            {towers.map(t => (
                <div key={t.id} className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-white ${TOWER_DEFINITIONS[t.type].color} shadow-lg z-10 flex items-center justify-center text-[10px]`} style={{ left: t.x, top: t.y }}>
                    {knowledge <= 0 && <AlertTriangle className="w-4 h-4 text-red-500 absolute -top-4 animate-bounce" />}
                </div>
            ))}
            {enemies.map(e => (
                <div key={e.id} className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border border-white ${e.isBoss ? 'bg-red-600 w-10 h-10 -ml-5 -mt-5 z-20' : 'bg-orange-500 z-10'}`} style={{ left: e.x, top: e.y }}></div>
            ))}
            {projectiles.map(p => <div key={p.id} className="absolute w-2 h-2 bg-yellow-300 rounded-full" style={{ left: p.x, top: p.y }}></div>)}
            
            {phase === 'SKILLS' && (
                <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-8">
                    <h2 className="text-3xl font-black mb-8 text-emerald-400">Tech Tree (SP: {skillPoints})</h2>
                    <div className="grid grid-cols-2 gap-12 w-full max-w-4xl">
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-600">
                            <h3 className="text-xl font-bold mb-4 text-blue-400">Ballistics (Tree A)</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><span>Range (+10%)</span> <button onClick={() => upgradeSkill('A', 'range')} disabled={skillPoints===0} className="bg-blue-600 px-3 py-1 rounded text-sm disabled:opacity-50">Lvl {skills.range} (+)</button></div>
                                <div className="flex justify-between items-center"><span>Damage (+10%)</span> <button onClick={() => upgradeSkill('A', 'damage')} disabled={skillPoints===0} className="bg-blue-600 px-3 py-1 rounded text-sm disabled:opacity-50">Lvl {skills.damage} (+)</button></div>
                            </div>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-600">
                            <h3 className="text-xl font-bold mb-4 text-purple-400">Alchemy (Tree B)</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><span>Efficiency (Cost -1)</span> <button onClick={() => upgradeSkill('B', 'efficiency')} disabled={skillPoints===0} className="bg-purple-600 px-3 py-1 rounded text-sm disabled:opacity-50">Lvl {skills.efficiency} (+)</button></div>
                                <div className="flex justify-between items-center"><span>Greed (Gold +20%)</span> <button onClick={() => upgradeSkill('B', 'greed')} disabled={skillPoints===0} className="bg-purple-600 px-3 py-1 rounded text-sm disabled:opacity-50">Lvl {skills.greed} (+)</button></div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setPhase('BUILD')} className="mt-8 px-8 py-3 bg-white text-slate-900 font-bold rounded-xl">Close Tree</button>
                </div>
            )}
        </div>

        {/* TOWER SELECTOR */}
        <div className="w-full max-w-6xl mt-4 grid grid-cols-7 gap-2">
            {Object.keys(TOWER_DEFINITIONS).map((key) => {
                const type = key as TowerType;
                const def = TOWER_DEFINITIONS[type];
                const locked = wave < def.unlockWave;
                return (
                    <button 
                        key={key} 
                        disabled={locked || gold < def.cost}
                        onClick={() => setPlacementMode(type)}
                        className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all relative overflow-hidden
                            ${locked ? 'bg-slate-800 border-slate-700 opacity-50' : placementMode === type ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}
                        `}
                    >
                        {locked && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold">W{def.unlockWave}</div>}
                        <div className={`w-3 h-3 rounded-full ${def.color}`}></div>
                        <div className="text-[10px] font-bold truncate w-full text-center">{def.name}</div>
                        <div className="text-[10px] text-yellow-400">{def.cost}g</div>
                    </button>
                );
            })}
        </div>

        {/* TRIVIA MODAL */}
        {showTrivia && currentQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-slate-800 p-8 rounded-2xl max-w-xl w-full border border-slate-600">
                    <h3 className="text-xl font-bold mb-6 text-center">{currentQuestion.question}</h3>
                    <div className="grid gap-3">
                        {currentQuestion.options.map((opt, i) => (
                            <button key={i} onClick={() => handleTriviaAnswer(i === currentQuestion.correctAnswerIndex)} className="p-4 bg-slate-700 hover:bg-blue-600 rounded-xl text-left font-medium transition-colors">{opt}</button>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TowerDefenseGame;