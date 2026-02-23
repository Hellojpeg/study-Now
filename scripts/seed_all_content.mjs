/**
 * Comprehensive seed script to migrate all data from constants.ts to Convex database.
 * 
 * Usage:
 *   node scripts/seed_all_content.mjs
 * 
 * Prerequisites:
 *   - CONVEX_URL environment variable must be set
 *   - Convex schema must be deployed (npx convex deploy)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

// Import hardcoded data from constants
import {
  QUIZZES,
  WORLD_HISTORY_MODULES,
  CIVICS_MODULES,
  US_HISTORY_MODULES,
  WORLD_HISTORY_COURSE_CONTENT,
  CIVICS_COURSE_CONTENT,
  US_HISTORY_COURSE_CONTENT,
  ANALYSIS_SCENARIOS,
} from "../constants.js";

const CONVEX_URL = process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL environment variable is required.");
  console.error("   Set it like: CONVEX_URL=https://your-project.convex.cloud node scripts/seed_all_content.mjs");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Course subject mapping
const SUBJECTS = {
  "world-history": {
    modules: WORLD_HISTORY_MODULES,
    content: WORLD_HISTORY_COURSE_CONTENT,
    questions: QUIZZES["world-history"]?.questions || [],
  },
  "civics": {
    modules: CIVICS_MODULES,
    content: CIVICS_COURSE_CONTENT,
    questions: QUIZZES["civics"]?.questions || [],
  },
  "us-history": {
    modules: US_HISTORY_MODULES,
    content: US_HISTORY_COURSE_CONTENT,
    questions: QUIZZES["us-history"]?.questions || [],
  },
};

async function getCourseBySubject(subjectId) {
  const courses = await client.query(api.functions.courses.list, {});
  return courses.find(c => c.subjectId === subjectId);
}

async function seedBenchmarks(subjectId, benchmarks) {
  console.log(`  📚 Seeding ${benchmarks.length} benchmarks for ${subjectId}...`);
  
  for (const benchmark of benchmarks) {
    try {
      await client.mutation(api.functions.benchmarks.create, {
        code: benchmark.code,
        description: benchmark.description,
        clarifications: benchmark.clarifications || [],
        subject: subjectId,
      });
    } catch (err) {
      console.warn(`    ⚠️ Benchmark ${benchmark.code} may already exist: ${err.message}`);
    }
  }
}

async function seedModules(courseId, modules) {
  console.log(`  📦 Seeding ${modules.length} modules...`);
  
  const moduleIdMap = {};      // Maps local module id (1, 2, 3) -> Convex module ID
  const benchmarkToModule = {}; // Maps benchmark code -> Convex module ID
  
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    try {
      const moduleId = await client.mutation(api.functions.modules.create, {
        courseId,
        title: mod.title,
        focus: mod.focus || "",
        keyTopics: mod.keyTopics || [],
        standardCodes: mod.standardCodes || [],
        keyConcepts: mod.keyConcepts || [],
        order: i,
      });
      moduleIdMap[mod.id] = moduleId;
      
      // Map each benchmark code to this module for question linking
      if (mod.standardCodes && mod.standardCodes.length > 0) {
        for (const code of mod.standardCodes) {
          benchmarkToModule[code] = moduleId;
        }
      }
      
      console.log(`    ✅ Module: ${mod.title}`);
      
      // Seed vocabulary if exists
      if (mod.vocabulary && mod.vocabulary.length > 0) {
        for (const vocab of mod.vocabulary) {
          await client.mutation(api.functions.vocabulary.create, {
            moduleId,
            term: vocab.term,
            definition: vocab.definition,
            image: vocab.image,
          });
        }
        console.log(`      📝 Added ${mod.vocabulary.length} vocabulary terms`);
      }
      
      // Seed chapters if exists
      if (mod.chapters && mod.chapters.length > 0) {
        for (let j = 0; j < mod.chapters.length; j++) {
          const chapter = mod.chapters[j];
          const chapterId = await client.mutation(api.functions.lessons.createChapter, {
            moduleId,
            title: chapter.title,
            order: j,
          });
          
          // Seed lessons within chapter
          if (chapter.lessons && chapter.lessons.length > 0) {
            for (let k = 0; k < chapter.lessons.length; k++) {
              const lesson = chapter.lessons[k];
              await client.mutation(api.functions.lessons.create, {
                chapterId,
                moduleId,
                title: lesson.title,
                content: lesson.content || [],
                image: lesson.image,
                order: k,
              });
            }
          }
        }
        console.log(`      📖 Added ${mod.chapters.length} chapters with lessons`);
      }
      
    } catch (err) {
      console.error(`    ❌ Failed to create module "${mod.title}": ${err.message}`);
    }
  }
  
  return { moduleIdMap, benchmarkToModule };
}

async function seedQuestions(courseId, questions, moduleMaps = {}) {
  const { moduleIdMap = {}, benchmarkToModule = {} } = moduleMaps;
  console.log(`  ❓ Seeding ${questions.length} questions...`);
  
  let successCount = 0;
  let linkedCount = 0;
  
  for (const q of questions) {
    try {
      // Try to find moduleId: first by benchmark, then by unit number
      let moduleId = undefined;
      
      if (q.benchmark && benchmarkToModule[q.benchmark]) {
        moduleId = benchmarkToModule[q.benchmark];
      } else if (q.unit) {
        // Extract unit number from "Unit 1", "Unit 2", etc.
        const unitMatch = q.unit.match(/Unit\s*(\d+)/i);
        if (unitMatch) {
          const unitNum = parseInt(unitMatch[1], 10);
          if (moduleIdMap[unitNum]) {
            moduleId = moduleIdMap[unitNum];
          }
        }
      }
      
      await client.mutation(api.functions.questions.create, {
        courseId,
        moduleId,  // Now properly linked!
        unit: q.unit || "General",
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        hint: q.hint,
        quarter: q.quarter,
        week: q.week,
        image: q.image,
        benchmark: q.benchmark,
        questionType: q.questionType || "MCQ",
        bloomLevel: q.bloomLevel,
      });
      successCount++;
      if (moduleId) linkedCount++;
    } catch (err) {
      console.error(`    ❌ Failed to create question: ${err.message}`);
    }
  }
  
  console.log(`    ✅ Created ${successCount}/${questions.length} questions (${linkedCount} linked to modules)`);
}

async function seedAnalysisScenarios(courseId) {
  console.log(`  📊 Seeding analysis scenarios...`);
  
  for (const scenario of ANALYSIS_SCENARIOS) {
    try {
      await client.mutation(api.functions.analysis.create, {
        courseId,
        title: scenario.title,
        excerpt: scenario.excerpt,
        source: scenario.source,
        image: scenario.image,
        tasks: scenario.tasks.map(t => ({
          id: t.id,
          type: t.type,
          prompt: t.prompt,
          rubricKeywords: t.rubricKeywords,
          sampleAnswer: t.sampleAnswer,
          vennLabels: t.vennLabels,
          vennItems: t.vennItems,
        })),
      });
      console.log(`    ✅ Scenario: ${scenario.title}`);
    } catch (err) {
      console.error(`    ❌ Failed to create scenario "${scenario.title}": ${err.message}`);
    }
  }
}

async function main() {
  console.log("🚀 Starting comprehensive data seed...\n");
  
  // Seed courses first
  console.log("📚 Ensuring courses exist...");
  await client.action(api.functions.seed.seedCourses, {});
  console.log("✅ Courses seeded.\n");
  
  // Process each subject
  for (const [subjectId, data] of Object.entries(SUBJECTS)) {
    console.log(`\n🌍 Processing ${subjectId}...`);
    
    const course = await getCourseBySubject(subjectId);
    if (!course) {
      console.error(`❌ Course not found for ${subjectId}. Run course seeding first.`);
      continue;
    }
    
    const courseId = course._id;
    console.log(`  Found course: ${course.name} (${courseId})`);
    
    // Seed benchmarks
    if (data.content?.benchmarks?.length > 0) {
      await seedBenchmarks(subjectId, data.content.benchmarks);
    }
    
    // Seed modules (returns maps for linking questions)
    const moduleMaps = await seedModules(courseId, data.modules);
    
    // Seed questions (with module linking via benchmarks/units)
    if (data.questions.length > 0) {
      await seedQuestions(courseId, data.questions, moduleMaps);
    }
    
    // Seed analysis scenarios (only for civics, which has them)
    if (subjectId === "civics" && ANALYSIS_SCENARIOS.length > 0) {
      await seedAnalysisScenarios(courseId);
    }
  }
  
  console.log("\n✅ Seed complete!");
}

main().catch(console.error);
