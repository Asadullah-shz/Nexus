import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileText, Upload, Eye, PenLine, CheckCircle, Clock, AlertCircle,
  Download, Trash2, X, ChevronDown, File, Shield
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { INITIAL_DOCS, Doc, DocStatus } from '../../data/documents';
import { useAuth } from '../../context/AuthContext';
import { PreviewModal } from '../../components/documents/PreviewModal';


const STATUS_CONFIG: Record<DocStatus, { variant: 'primary' | 'warning' | 'success'; icon: React.ReactNode; label: string }> = {
  'Draft': { variant: 'primary', icon: <Clock size={12} />, label: 'Draft' },
  'In Review': { variant: 'warning', icon: <AlertCircle size={12} />, label: 'In Review' },
  'Signed': { variant: 'success', icon: <CheckCircle size={12} />, label: 'Signed' }
};

// Simple signature pad component
const SignaturePad: React.FC<{ onSign: (sig: string) => void; onClose: () => void }> = ({ onSign, onClose }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSig(true);
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1D4ED8';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const handleSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSign(canvas.toDataURL());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">E-Signature</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">Draw your signature in the box below. This will be used as your electronic signature.</p>

          <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
            <canvas
              ref={canvasRef}
              width={460}
              height={160}
              className="w-full cursor-crosshair"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>

          <div className="flex items-center justify-between">
            <button onClick={clear} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <X size={14} /> Clear
            </button>
            <p className="text-xs text-gray-400">Draw signature above</p>
          </div>

          <div className="bg-primary-50 border border-primary-100 rounded-lg p-3 text-xs text-primary-700">
            By signing, you agree this electronic signature is the legal equivalent of your handwritten signature.
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSign} disabled={!hasSig} className="flex-1" leftIcon={<PenLine size={16} />}>
            Apply Signature
          </Button>
        </div>
      </div>
    </div>
  );
};


export const DocumentChamberPage: React.FC = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [signingDoc, setSigningDoc] = useState<Doc | null>(null);
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'All'>('All');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocs: Doc[] = acceptedFiles.map((file, i) => ({
      id: `uploaded-${Date.now()}-${i}`,
      name: file.name,
      type: file.name.endsWith('.pdf') ? 'PDF' : 'Document',
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Draft',
      ownerId: user?.id || 'unknown'
    }));
    setDocs(d => [...newDocs, ...d]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
  });

  const handleSign = (docId: string) => {
    setDocs(d => d.map(doc => doc.id === docId
      ? { ...doc, status: 'Signed', signedBy: [...(doc.signedBy || []), 'You'] }
      : doc
    ));
    setSigningDoc(null);
    setPreviewDoc(null);
  };

  const updateStatus = (docId: string, status: DocStatus) => {
    setDocs(d => d.map(doc => doc.id === docId ? { ...doc, status } : doc));
  };

  const deleteDoc = (docId: string) => {
    setDocs(d => d.filter(doc => doc.id !== docId));
  };

  const filteredDocs = statusFilter === 'All' ? docs : docs.filter(d => d.status === statusFilter);

  const counts = {
    All: docs.length,
    Draft: docs.filter(d => d.status === 'Draft').length,
    'In Review': docs.filter(d => d.status === 'In Review').length,
    Signed: docs.filter(d => d.status === 'Signed').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Securely manage deals, contracts, and agreements</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['All', 'Draft', 'In Review', 'Signed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              statusFilter === s ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{counts[s]}</p>
            <p className="text-sm text-gray-600 mt-1">{s === 'All' ? 'Total Documents' : s}</p>
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className={`mx-auto mb-3 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Supports PDF, DOC, DOCX</p>
      </div>

      {/* Documents list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {statusFilter === 'All' ? 'All Documents' : statusFilter}
              <span className="ml-2 text-sm font-normal text-gray-500">({filteredDocs.length})</span>
            </h2>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12">
              <File size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No documents found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredDocs.map(doc => {
                const statusCfg = STATUS_CONFIG[doc.status];
                return (
                  <div key={doc.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-primary-50 rounded-lg mr-4 flex-shrink-0">
                      <FileText size={22} className="text-primary-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
                        <Badge variant={statusCfg.variant} size="sm">
                          <span className="flex items-center gap-1">{statusCfg.icon}{statusCfg.label}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span>Uploaded {doc.uploadedAt}</span>
                        {doc.signedBy && doc.signedBy.length > 0 && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={10} /> {doc.signedBy.length} signature(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Status changer */}
                      {doc.status !== 'Signed' && (
                        <div className="relative group">
                          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1">
                            Change Status <ChevronDown size={10} />
                          </button>
                          <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-28">
                            {(['Draft', 'In Review', 'Signed'] as DocStatus[])
                              .filter(s => s !== doc.status)
                              .map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(doc.id, s)}
                                  className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                >
                                  {s}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye size={16} />
                      </button>

                      {doc.status !== 'Signed' && (
                        <button
                          onClick={() => { setSigningDoc(doc); }}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Sign"
                        >
                          <PenLine size={16} />
                        </button>
                      )}

                      <button
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>

                      <button
                        onClick={() => deleteDoc(doc.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      {previewDoc && (
        <PreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onSign={() => { setSigningDoc(previewDoc); }}
        />
      )}

      {signingDoc && (
        <SignaturePad
          onSign={() => handleSign(signingDoc.id)}
          onClose={() => setSigningDoc(null)}
        />
      )}
    </div>
  );
};

export const DocumentsPage = DocumentChamberPage;
