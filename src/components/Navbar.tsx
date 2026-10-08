import React from 'react';
import { ClipboardCheck, Users, BarChart3, PlusCircle, Download, RotateCcw, Lock, LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  isOnline?: boolean;
  currentTab: 'dashboard' | 'patients' | 'villages';
  onSelectTab: (tab: 'dashboard' | 'patients' | 'villages') => void;
  onOpenNewAssessment: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  onClearAll?: () => void;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  totalPatients: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  isOnline = true,
  currentTab,
  onSelectTab,
  onOpenNewAssessment,
  onExportCSV,
  onResetData,
  onClearAll,
  onOpenAdminLogin,
  onAdminLogout,
  totalPatients,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                ระบบประเมินภาวะพึ่งพิง ADL ชุมชน
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  8 หมู่บ้าน · เกณฑ์ Barthel Index
                </span>
                <span
                  title={isOnline ? 'เชื่อมต่อฐานข้อมูลออนไลน์เรียบร้อย ข้อมูลเชื่อมโยงทุกคนที่มีลิงก์' : 'โหมดแคชในเครื่อง'}
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                    isOnline
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 hidden sm:inline">
                    หน้าประเมินสาธารณะ
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Only shown when Admin is logged in!) */}
          {isAdmin ? (
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentTab === 'dashboard'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>ภาพรวมสถิติ</span>
              </button>

              <button
                onClick={() => onSelectTab('patients')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentTab === 'patients'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>ทะเบียนผู้ป่วย</span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {totalPatients}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('villages')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentTab === 'villages'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>รายงาน 8 หมู่บ้าน</span>
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center text-xs text-slate-500 gap-1.5">
              <span>ทุกคนสามารถทำแบบประเมินได้โดยไม่ต้องใส่รหัสผ่าน</span>
            </div>
          )}

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <button
                  onClick={onExportCSV}
                  title="ส่งออกรายงาน Excel (CSV)"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>ส่งออก Excel</span>
                </button>

                {totalPatients > 0 && onClearAll && (
                  <button
                    onClick={onClearAll}
                    title="ลบรายชื่อผู้ป่วยทั้งหมดออกจากระบบ"
                    className="hidden xl:flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ลบทุกรายชื่อ</span>
                  </button>
                )}

                {totalPatients === 0 && (
                  <button
                    onClick={onResetData}
                    title="โหลดข้อมูลตัวอย่าง 8 หมู่บ้าน"
                    className="hidden xl:flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>โหลดข้อมูลตัวอย่าง</span>
                  </button>
                )}

                <button
                  onClick={onOpenNewAssessment}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ ประเมิน ADL</span>
                </button>

                <button
                  onClick={onAdminLogout}
                  title="ออกจากระบบ Admin"
                  className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>เข้าสู่ระบบ Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar for Admin */}
        {isAdmin && (
          <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex flex-col items-center gap-1 py-1 px-3 font-medium rounded ${
                currentTab === 'dashboard' ? 'text-teal-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>ภาพรวม</span>
            </button>
            <button
              onClick={() => onSelectTab('patients')}
              className={`flex flex-col items-center gap-1 py-1 px-3 font-medium rounded ${
                currentTab === 'patients' ? 'text-teal-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>รายชื่อ ({totalPatients})</span>
            </button>
            <button
              onClick={() => onSelectTab('villages')}
              className={`flex flex-col items-center gap-1 py-1 px-3 font-medium rounded ${
                currentTab === 'villages' ? 'text-teal-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>8 หมู่บ้าน</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
