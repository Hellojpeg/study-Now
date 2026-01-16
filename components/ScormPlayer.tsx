import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { X, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ScormPlayerProps {
  packageId: string;
  manifestUrl: string;
  studentId: string;
  studentName: string;
  classId?: string;
  onClose: () => void;
  onComplete?: (status: string, score?: number) => void;
}

interface CmiData {
  coreStudentId?: string;
  coreStudentName?: string;
  coreLessonLocation?: string;
  coreLessonStatus?: string;
  coreScoreRaw?: number;
  coreScoreMin?: number;
  coreScoreMax?: number;
  coreTotalTime?: string;
  coreSessionTime?: string;
  coreExit?: string;
  coreEntry?: string;
  suspendData?: string;
  launchData?: string;
  comments?: string;
  objectives?: string;
  interactions?: string;
}

// SCORM 1.2 time format: HHHH:MM:SS.ss
function addScormTime(time1: string, time2: string): string {
  const parse = (t: string) => {
    const parts = t.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const mins = parseInt(parts[1] || '0', 10);
    const secs = parseFloat(parts[2] || '0');
    return hours * 3600 + mins * 60 + secs;
  };

  const total = parse(time1 || '0000:00:00.00') + parse(time2 || '0000:00:00.00');
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = (total % 60).toFixed(2);
  
  return `${hours.toString().padStart(4, '0')}:${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
}

const ScormPlayer: React.FC<ScormPlayerProps> = ({
  packageId,
  manifestUrl,
  studentId,
  studentName,
  classId,
  onClose,
  onComplete
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('not attempted');
  const [score, setScore] = useState<number | null>(null);
  const sessionStartTime = useRef(Date.now());
  
  // Convex mutations/queries
  const existingAttempt = useQuery("functions/scorm:getAttemptForPackageStudent" as any, { 
    packageId, 
    studentId 
  });
  const saveAttempt = useMutation("functions/scorm:createOrUpdateAttempt" as any);

  // CMI data state (SCORM 1.2 data model)
  const cmiDataRef = useRef<CmiData>({
    coreStudentId: studentId,
    coreStudentName: studentName,
    coreLessonStatus: 'not attempted',
    coreEntry: 'ab-initio',
    coreTotalTime: '0000:00:00.00',
  });

  // Load existing attempt data if available
  useEffect(() => {
    if (existingAttempt && existingAttempt.cmiData) {
      cmiDataRef.current = {
        ...existingAttempt.cmiData,
        coreEntry: existingAttempt.cmiData.coreLessonStatus === 'incomplete' ? 'resume' : 'ab-initio',
      };
      setStatus(existingAttempt.cmiData.coreLessonStatus || 'not attempted');
      if (existingAttempt.cmiData.coreScoreRaw !== undefined) {
        setScore(existingAttempt.cmiData.coreScoreRaw);
      }
    }
  }, [existingAttempt]);

  // Calculate session time
  const getSessionTime = useCallback(() => {
    const elapsed = (Date.now() - sessionStartTime.current) / 1000;
    const hours = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = (elapsed % 60).toFixed(2);
    return `${hours.toString().padStart(4, '0')}:${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
  }, []);

  // Save progress to Convex
  const saveProgress = useCallback(async () => {
    const sessionTime = getSessionTime();
    cmiDataRef.current.coreSessionTime = sessionTime;
    cmiDataRef.current.coreTotalTime = addScormTime(
      cmiDataRef.current.coreTotalTime || '0000:00:00.00',
      sessionTime
    );

    try {
      await saveAttempt({
        packageId,
        studentId,
        classId,
        cmiData: cmiDataRef.current,
      });
    } catch (err) {
      console.error('Failed to save SCORM progress:', err);
    }
  }, [packageId, studentId, classId, saveAttempt, getSessionTime]);

  // SCORM 1.2 API implementation
  const createScormAPI = useCallback(() => {
    return {
      // SCORM 1.2 required functions
      LMSInitialize: (param: string): string => {
        console.log('[SCORM] LMSInitialize', param);
        sessionStartTime.current = Date.now();
        return 'true';
      },

      LMSFinish: (param: string): string => {
        console.log('[SCORM] LMSFinish', param);
        saveProgress();
        return 'true';
      },

      LMSGetValue: (element: string): string => {
        console.log('[SCORM] LMSGetValue', element);
        const cmi = cmiDataRef.current;
        
        const mapping: Record<string, () => string> = {
          'cmi.core.student_id': () => cmi.coreStudentId || '',
          'cmi.core.student_name': () => cmi.coreStudentName || '',
          'cmi.core.lesson_location': () => cmi.coreLessonLocation || '',
          'cmi.core.lesson_status': () => cmi.coreLessonStatus || 'not attempted',
          'cmi.core.score.raw': () => cmi.coreScoreRaw?.toString() || '',
          'cmi.core.score.min': () => cmi.coreScoreMin?.toString() || '0',
          'cmi.core.score.max': () => cmi.coreScoreMax?.toString() || '100',
          'cmi.core.total_time': () => cmi.coreTotalTime || '0000:00:00.00',
          'cmi.core.entry': () => cmi.coreEntry || 'ab-initio',
          'cmi.core.exit': () => cmi.coreExit || '',
          'cmi.suspend_data': () => cmi.suspendData || '',
          'cmi.launch_data': () => cmi.launchData || '',
          'cmi.comments': () => cmi.comments || '',
        };

        const getter = mapping[element];
        return getter ? getter() : '';
      },

      LMSSetValue: (element: string, value: string): string => {
        console.log('[SCORM] LMSSetValue', element, value);
        const cmi = cmiDataRef.current;

        const mapping: Record<string, (v: string) => void> = {
          'cmi.core.lesson_location': (v) => { cmi.coreLessonLocation = v; },
          'cmi.core.lesson_status': (v) => {
            cmi.coreLessonStatus = v;
            setStatus(v);
            if (v === 'completed' || v === 'passed') {
              onComplete?.(v, cmi.coreScoreRaw);
            }
          },
          'cmi.core.score.raw': (v) => {
            cmi.coreScoreRaw = parseFloat(v);
            setScore(parseFloat(v));
          },
          'cmi.core.score.min': (v) => { cmi.coreScoreMin = parseFloat(v); },
          'cmi.core.score.max': (v) => { cmi.coreScoreMax = parseFloat(v); },
          'cmi.core.session_time': (v) => { cmi.coreSessionTime = v; },
          'cmi.core.exit': (v) => { cmi.coreExit = v; },
          'cmi.suspend_data': (v) => { cmi.suspendData = v; },
          'cmi.comments': (v) => { cmi.comments = v; },
        };

        const setter = mapping[element];
        if (setter) {
          setter(value);
          return 'true';
        }
        return 'false';
      },

      LMSCommit: (param: string): string => {
        console.log('[SCORM] LMSCommit', param);
        saveProgress();
        return 'true';
      },

      LMSGetLastError: (): string => '0',
      LMSGetErrorString: (errorCode: string): string => {
        const errors: Record<string, string> = {
          '0': 'No error',
          '101': 'General exception',
          '201': 'Invalid argument error',
          '202': 'Element cannot have children',
          '203': 'Element not an array',
          '301': 'Not initialized',
          '401': 'Not implemented error',
          '402': 'Invalid set value',
          '403': 'Element is read only',
          '404': 'Element is write only',
        };
        return errors[errorCode] || 'Unknown error';
      },
      LMSGetDiagnostic: (errorCode: string): string => errorCode,
    };
  }, [saveProgress, onComplete]);

  // Inject SCORM API into iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setLoading(false);
      try {
        const iframeWindow = iframe.contentWindow as any;
        if (iframeWindow) {
          // SCORM 1.2 API object
          iframeWindow.API = createScormAPI();
          console.log('[SCORM] API injected into iframe');
        }
      } catch (err) {
        console.error('[SCORM] Failed to inject API:', err);
        setError('Failed to initialize SCORM content. Cross-origin restrictions may apply.');
      }
    };

    const handleError = () => {
      setLoading(false);
      setError('Failed to load SCORM content');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [createScormAPI]);

  // Save on close/unmount
  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, [saveProgress]);

  // Handle window close
  const handleClose = async () => {
    await saveProgress();
    onClose();
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'completed':
      case 'passed':
        return 'text-emerald-500';
      case 'failed':
        return 'text-red-500';
      case 'incomplete':
        return 'text-amber-500';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-800">SCORM Player</h2>
            <div className={`flex items-center gap-2 text-sm font-medium ${getStatusColor(status)}`}>
              {status === 'completed' || status === 'passed' ? (
                <CheckCircle className="w-4 h-4" />
              ) : status === 'failed' ? (
                <AlertCircle className="w-4 h-4" />
              ) : null}
              <span className="capitalize">{status}</span>
              {score !== null && (
                <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  Score: {score}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => iframeRef.current?.contentWindow?.location.reload()}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reload content"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-slate-100">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-slate-500 font-medium">Loading SCORM content...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    iframeRef.current?.contentWindow?.location.reload();
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={manifestUrl}
            className="w-full h-full border-0"
            title="SCORM Content"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
};

export default ScormPlayer;
