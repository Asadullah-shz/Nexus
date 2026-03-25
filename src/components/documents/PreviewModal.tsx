import React from 'react';
import { FileText, Download, PenLine, X, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Doc } from '../../data/documents';

interface PreviewModalProps {
  doc: Doc;
  onClose: () => void;
  onSign?: () => void;
  showSignButton?: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ 
  doc, 
  onClose, 
  onSign, 
  showSignButton = true 
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 truncate">{doc.name}</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Mock document preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 min-h-64">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900">{doc.name.replace(/\.[^.]+$/, '')}</h3>
              <p className="text-sm text-gray-500 mt-1">Document Preview</p>
            </div>

            {/* Simulated document content */}
            {doc.content ? (
              <div className="space-y-6">
                {doc.content.map((section, i) => (
                  <div key={i} className="space-y-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <h4 className="text-xs font-bold text-primary-700 uppercase tracking-widest">{section.title}</h4>
                    <div className="space-y-1.5">
                      {section.lines.map((line, j) => (
                        <p key={j} className="text-sm text-gray-700 leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  {i === 0 && <div className="h-4 bg-gray-300 rounded w-1/2" />}
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              ))
            )}

            {doc.status === 'Signed' && doc.signedBy && (
              <div className="mt-8 pt-6 border-t border-gray-300">
                <p className="text-sm font-medium text-gray-700 mb-3">Signatures:</p>
                {doc.signedBy.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <div className="font-dancing text-primary-700 italic text-lg" style={{ fontFamily: 'cursive' }}>
                      {name}
                    </div>
                    <CheckCircle size={14} className="text-green-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 p-5 border-t border-gray-100">
        <Button variant="outline" leftIcon={<Download size={16} />}>Download</Button>
        {showSignButton && doc.status !== 'Signed' && onSign && (
          <Button onClick={onSign} leftIcon={<PenLine size={16} />}>Sign Document</Button>
        )}
        <Button variant="outline" onClick={onClose} className="ml-auto">Close</Button>
      </div>
    </div>
  </div>
);
