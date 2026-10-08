import React, { useState, useEffect } from 'react';
import { Patient, VillageId, ADLCategory } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PatientListView } from './components/PatientListView';
import { VillagesReportView } from './components/VillagesReportView';
import { AssessmentFormModal } from './components/AssessmentFormModal';
import { PatientDetailModal } from './components/PatientDetailModal';
import { PrintReportView } from './components/PrintReportView';
import { PublicAssessmentView } from './components/PublicAssessmentView';
import { AdminLoginModal } from './components/AdminLoginModal';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Authentication Role State
  // By default, everyone enters without password and sees only the public ADL Assessment page!
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('adl_is_admin') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Admin Navigation Tabs
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'patients' | 'villages' | 'print'>('dashboard');
  
  // Filters
  const [selectedVillage, setSelectedVillage] = useState<VillageId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ADLCategory>('all');

  // Modals & Active Items
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'reassess'>('new');
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [printPatient, setPrintPatient] = useState<Patient | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Subscribe to real-time online Cloud Firestore database
  useEffect(() => {
    // 1. One-time clear of sample data as requested by user
    if (localStorage.getItem('adl_has_cleared_initial_v4') !== 'true') {
      storageService.clearAllPatients();
      localStorage.setItem('adl_has_cleared_initial_v4', 'true');
    }

    // 2. Initial cached data
    const cached = storageService.getPatients();
    setPatients(cached);

    // 3. Real-time online sync across all devices that open the link!
    const unsubscribe = storageService.subscribeToPatients(
      (onlinePatients) => {
        setPatients(onlinePatients);
      },
      (onlineStatus) => {
        setIsOnline(onlineStatus);
      }
    );

    return () => unsubscribe();
  }, []);

  // Admin Login Handler
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    showToast('เข้าสู่ระบบผู้ดูแลระบบ (Admin) สำเร็จ');
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    localStorage.removeItem('adl_is_admin');
    setIsAdmin(false);
    setCurrentTab('dashboard');
    showToast('ออกจากระบบผู้ดูแลระบบแล้ว กลับสู่หน้าประเมินสาธารณะ');
  };

  // Save or Update patient to Cloud Firestore
  const handleSavePatient = async (patient: Patient) => {
    const exists = patients.some((p) => p.id === patient.id);
    await storageService.savePatient(patient);

    if (exists) {
      showToast(`อัปเดตข้อมูลของ "${patient.prefix}${patient.firstName} ${patient.lastName}" บันทึกออนไลน์สำเร็จ`);
    } else {
      showToast(`บันทึกแบบประเมินของ "${patient.prefix}${patient.firstName} ${patient.lastName}" ออนไลน์เรียบร้อย`);
    }

    if (detailPatient && detailPatient.id === patient.id) {
      setDetailPatient(patient);
    }
  };

  // Delete patient from Cloud Firestore
  const handleDeletePatient = async (id: string) => {
    await storageService.deletePatient(id);
    if (detailPatient?.id === id) {
      setDetailPatient(null);
    }
    showToast('ลบข้อมูลออกจากระบบออนไลน์เรียบร้อยแล้ว');
  };

  // Clear all patients
  const handleClearAllPatients = async () => {
    await storageService.clearAllPatients();
    setPatients([]);
    showToast('ลบรายชื่อผู้ป่วยทั้งหมดออกจากระบบเรียบร้อยแล้ว');
  };

  // Load sample data (8 villages)
  const handleResetData = async () => {
    const loaded = await storageService.loadSampleData();
    setPatients(loaded);
    setSelectedVillage('all');
    setSelectedCategory('all');
    showToast('โหลดข้อมูลตัวอย่าง 8 หมู่บ้านเรียบร้อยแล้ว');
  };

  // Export CSV
  const handleExportCSV = () => {
    storageService.exportToCSV(patients);
    showToast('ดาวน์โหลดไฟล์รายงาน Excel (CSV) เรียบร้อยแล้ว');
  };

  // Open Form for New Assessment (Admin)
  const handleOpenNewAssessment = () => {
    setPatientToEdit(null);
    setFormMode('new');
    setIsFormModalOpen(true);
  };

  // Open Form for Edit (Admin)
  const handleEditPatient = (p: Patient) => {
    setPatientToEdit(p);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  // Open Form for Re-assessment (Admin)
  const handleReAssessPatient = (p: Patient) => {
    setPatientToEdit(p);
    setFormMode('reassess');
    setIsFormModalOpen(true);
  };

  // Open Print View
  const handleOpenPrint = (p: Patient) => {
    setPrintPatient(p);
    setCurrentTab('print');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter selection from Dashboard
  const handleDashboardSelectVillage = (vId: VillageId | 'all') => {
    setSelectedVillage(vId);
    setCurrentTab('patients');
  };

  const handleDashboardSelectCategory = (cat: 'all' | ADLCategory) => {
    setSelectedCategory(cat);
    setCurrentTab('patients');
  };

  // Select Village from Report View
  const handleReportSelectVillage = (vId: VillageId) => {
    setSelectedVillage(vId);
    setSelectedCategory('all');
    setCurrentTab('patients');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Prompt',sans-serif] text-slate-800 antialiased">
      {/* Top Navigation */}
      <div className="print:hidden">
        <Navbar
          isAdmin={isAdmin}
          isOnline={isOnline}
          currentTab={currentTab === 'print' ? 'patients' : currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenNewAssessment={handleOpenNewAssessment}
          onExportCSV={handleExportCSV}
          onResetData={handleResetData}
          onClearAll={handleClearAllPatients}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onAdminLogout={handleAdminLogout}
          totalPatients={patients.length}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!isAdmin ? (
          /* ======================================================== */
          /* PUBLIC VIEW: เข้าได้ทุกคนโดยไม่ต้องใส่รหัส เห็นแค่หน้าประเมิน ADL */
          /* ======================================================== */
          <PublicAssessmentView
            onSaveAssessment={handleSavePatient}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        ) : (
          /* ======================================================== */
          /* ADMIN VIEW: เมื่อใส่รหัส Admin เข้ามาแล้ว จัดการได้ทุกอย่าง */
          /* ======================================================== */
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                patients={patients}
                onSelectVillage={handleDashboardSelectVillage}
                onSelectCategory={handleDashboardSelectCategory}
                onOpenPatientDetail={(p) => setDetailPatient(p)}
                onOpenNewAssessment={handleOpenNewAssessment}
              />
            )}

            {currentTab === 'patients' && (
              <PatientListView
                patients={patients}
                selectedVillage={selectedVillage}
                onSelectVillage={setSelectedVillage}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenPatientDetail={(p) => setDetailPatient(p)}
                onOpenNewAssessment={handleOpenNewAssessment}
                onEditPatient={handleEditPatient}
                onReAssessPatient={handleReAssessPatient}
                onPrintPatient={handleOpenPrint}
                onDeletePatient={handleDeletePatient}
              />
            )}

            {currentTab === 'villages' && (
              <VillagesReportView
                patients={patients}
                onSelectVillageAndFilter={handleReportSelectVillage}
                onExportCSV={handleExportCSV}
              />
            )}

            {currentTab === 'print' && (
              <PrintReportView
                patient={printPatient}
                onBack={() => setCurrentTab('patients')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>ระบบประเมินภาวะพึ่งพิง ADL ชุมชน 8 หมู่บ้าน</span>
            <span aria-hidden="true">·</span>
            {!isAdmin ? (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="text-teal-700 font-semibold hover:underline"
              >
                สำหรับเจ้าหน้าที่ (เข้าสู่ระบบ Admin)
              </button>
            ) : (
              <span className="text-amber-800 font-medium">เข้าสู่ระบบในฐานะผู้ดูแล (Admin)</span>
            )}
          </div>
          <div className="text-slate-400">
            Barthel Index มาตรฐานกรมอนามัย สธ. & สำนักงานหลักประกันสุขภาพแห่งชาติ (สปสช.)
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Modals */}
      {isFormModalOpen && (
        <AssessmentFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSavePatient}
          patientToEdit={patientToEdit}
          initialMode={formMode}
        />
      )}

      {detailPatient && (
        <PatientDetailModal
          patient={detailPatient}
          onClose={() => setDetailPatient(null)}
          onPrint={handleOpenPrint}
          onEdit={(p) => {
            setDetailPatient(null);
            handleEditPatient(p);
          }}
          onReAssess={(p) => {
            setDetailPatient(null);
            handleReAssessPatient(p);
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
