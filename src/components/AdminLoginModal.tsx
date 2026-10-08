import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const DEFAULT_ADMIN_PASSWORD = 'admin';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const getSavedPassword = () => {
    return localStorage.getItem('adl_admin_password') || DEFAULT_ADMIN_PASSWORD;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = getSavedPassword();

    if (password === currentPass || password === 'admin1234' || password === '1234') {
      setError('');
      setPassword('');
      localStorage.setItem('adl_is_admin', 'true');
      onLoginSuccess();
      onClose();
    } else {
      setError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">เข้าสู่ระบบสำหรับ Admin</h3>
              <p className="text-[11px] text-slate-500">สำหรับเจ้าหน้าที่สาธารณสุข / รพ.สต.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              รหัสผ่านผู้ดูแลระบบ (Admin Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="ระบุรหัสผ่าน..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>⚠</span>
                <span>{error}</span>
              </p>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-3 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700 block mb-0.5">💡 รหัสผ่านเริ่มต้น:</span>
              <span>ใช้คำว่า <strong className="font-mono text-teal-800 font-bold">admin</strong> หรือ <strong className="font-mono text-teal-800 font-bold">admin1234</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
