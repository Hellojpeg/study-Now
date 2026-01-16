import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { 
  Upload, Package, Trash2, Users, Eye, Plus, X, 
  CheckCircle, AlertCircle, Loader2, BarChart2, 
  FileText, Settings, ChevronDown, ChevronRight 
} from 'lucide-react';

interface ScormManagerProps {
  teacherId: string;
  onLaunchPackage?: (packageId: string, manifestUrl: string) => void;
}

interface ScormPackage {
  _id: string;
  title: string;
  description?: string;
  version: string;
  filename: string;
  manifestUrl: string;
  classIds: string[];
  createdAt: number;
  metadata?: {
    entryPoint?: string;
    masteryScore?: number;
    maxTimeAllowed?: string;
  };
}

const ScormManager: React.FC<ScormManagerProps> = ({ teacherId, onLaunchPackage }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convex data
  const packages = useQuery(api.functions.scorm.listPackagesForTeacher, { teacherId }) || [];
  const classes = useQuery(api.functions.classes.listClassesForTeacher, { teacherId }) || [];
  const createPackage = useMutation(api.functions.scorm.createPackage);
  const updatePackage = useMutation(api.functions.scorm.updatePackage);
  const deletePackageMutation = useMutation(api.functions.scorm.deletePackage);

  // Get report for selected package
  const packageReport = useQuery(
    api.functions.scorm.getPackageReport,
    selectedPackage ? { packageId: selectedPackage } : undefined
  );

  // Handle file upload
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setUploadError('Please upload a .zip file');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('package', file);

      const response = await fetch('/api/scorm/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Save to Convex
      await createPackage({
        title: result.metadata.title || file.name.replace('.zip', ''),
        version: result.metadata.version || '1.2',
        teacherId,
        filename: file.name,
        storagePath: result.storagePath,
        manifestUrl: result.manifestUrl,
        metadata: result.metadata,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload SCORM package. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle package deletion
  const handleDelete = async (pkg: ScormPackage) => {
    if (!confirm(`Are you sure you want to delete "${pkg.title}"? This will also remove all student progress data.`)) {
      return;
    }

    try {
      // Delete from server filesystem
      await fetch(`/api/scorm/package/${encodeURIComponent(pkg.filename.replace('.zip', ''))}`, {
        method: 'DELETE',
      });

      // Delete from Convex
      await deletePackageMutation({ packageId: pkg._id });
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete package');
    }
  };

  // Handle class assignment
  const handleAssign = async (packageId: string, classIds: string[]) => {
    try {
      await updatePackage({ packageId, classIds });
      setShowAssignModal(false);
      setSelectedPackage(null);
    } catch (err) {
      console.error('Assignment error:', err);
      alert('Failed to assign package to classes');
    }
  };

  // Get selected package data
  const currentPackage = packages.find((p: ScormPackage) => p._id === selectedPackage);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-500" />
          Upload SCORM Package
        </h3>
        
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleUpload}
            className="hidden"
            id="scorm-upload"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-slate-600 font-medium">Uploading and processing...</span>
            </div>
          ) : (
            <label 
              htmlFor="scorm-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                <Package className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <span className="text-indigo-600 font-bold">Click to upload</span>
                <span className="text-slate-500"> or drag and drop</span>
              </div>
              <span className="text-xs text-slate-400">SCORM 1.2 or 2004 package (.zip)</span>
            </label>
          )}
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{uploadError}</span>
          </div>
        )}
      </div>

      {/* Packages List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Your SCORM Packages
        </h3>

        {packages.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No packages uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg: ScormPackage) => (
              <div
                key={pkg._id}
                className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{pkg.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">
                        SCORM {pkg.version}
                      </span>
                      <span>{pkg.classIds.length} class(es) assigned</span>
                      {pkg.metadata?.masteryScore && (
                        <span>Mastery: {pkg.metadata.masteryScore}%</span>
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-slate-500 mt-2">{pkg.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onLaunchPackage?.(pkg._id, pkg.manifestUrl)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => { setSelectedPackage(pkg._id); setShowAssignModal(true); }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Assign to classes"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => { setSelectedPackage(pkg._id); setShowReportModal(true); }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="View reports"
                    >
                      <BarChart2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && currentPackage && (
        <AssignModal
          pkg={currentPackage}
          classes={classes}
          onAssign={(classIds) => handleAssign(currentPackage._id, classIds)}
          onClose={() => { setShowAssignModal(false); setSelectedPackage(null); }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && currentPackage && (
        <ReportModal
          pkg={currentPackage}
          report={packageReport || []}
          onClose={() => { setShowReportModal(false); setSelectedPackage(null); }}
        />
      )}
    </div>
  );
};

// Assignment Modal Component
interface AssignModalProps {
  pkg: ScormPackage;
  classes: any[];
  onAssign: (classIds: string[]) => void;
  onClose: () => void;
}

const AssignModal: React.FC<AssignModalProps> = ({ pkg, classes, onAssign, onClose }) => {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(pkg.classIds || []);

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Assign to Classes</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">"{pkg.title}"</p>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto">
          {classes.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No classes available</p>
          ) : (
            <div className="space-y-2">
              {classes.map((cls: any) => (
                <label
                  key={cls._id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedClasses.includes(cls._id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(cls._id)}
                    onChange={() => toggleClass(cls._id)}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-medium text-slate-800">{cls.name}</div>
                    <div className="text-xs text-slate-500">{cls.section} • {(cls.studentIds || []).length} students</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(selectedClasses)}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

// Report Modal Component
interface ReportModalProps {
  pkg: ScormPackage;
  report: any[];
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ pkg, report, onClose }) => {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'completed': 'bg-emerald-100 text-emerald-700',
      'passed': 'bg-emerald-100 text-emerald-700',
      'failed': 'bg-red-100 text-red-700',
      'incomplete': 'bg-amber-100 text-amber-700',
      'not attempted': 'bg-slate-100 text-slate-600',
    };
    return styles[status] || styles['not attempted'];
  };

  const completedCount = report.filter(r => r.status === 'completed' || r.status === 'passed').length;
  const avgScore = report.filter(r => r.score !== undefined && r.score !== null)
    .reduce((acc, r, _, arr) => acc + r.score / arr.length, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Progress Report</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">"{pkg.title}"</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-200 bg-slate-50">
          <div className="text-center">
            <div className="text-2xl font-black text-slate-800">{report.length}</div>
            <div className="text-xs text-slate-500 font-medium uppercase">Total Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-600">{completedCount}</div>
            <div className="text-xs text-slate-500 font-medium uppercase">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-indigo-600">
              {avgScore > 0 ? avgScore.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase">Avg Score</div>
          </div>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto">
          {report.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No attempts recorded yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b border-slate-200">
                  <th className="text-left pb-3 font-medium">Student</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Score</th>
                  <th className="text-right pb-3 font-medium">Time</th>
                  <th className="text-right pb-3 font-medium">Last Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.map((r: any) => (
                  <tr key={r.attemptId} className="hover:bg-slate-50">
                    <td className="py-3">
                      <div className="font-medium text-slate-800">{r.studentName}</div>
                      <div className="text-xs text-slate-500">{r.studentEmail}</div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-700">
                      {r.score !== undefined && r.score !== null ? r.score : '—'}
                    </td>
                    <td className="py-3 text-right text-sm text-slate-500">
                      {r.totalTime || '—'}
                    </td>
                    <td className="py-3 text-right text-sm text-slate-500">
                      {r.lastAccessedAt ? new Date(r.lastAccessedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScormManager;
