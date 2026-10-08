import React, { useState } from 'react';
import { Patient, VillageId, ADLCategory } from '../types';
import { VILLAGES } from '../constants/villages';
import {
  Search,
  PlusCircle,
  Eye,
  Printer,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  LayoutGrid,
  List,
  Phone,
  User,
  CreditCard,
  RotateCcw,
} from 'lucide-react';

interface PatientListViewProps {
  patients: Patient[];
  selectedVillage: VillageId | 'all';
  onSelectVillage: (villageId: VillageId | 'all') => void;
  selectedCategory: 'all' | ADLCategory;
  onSelectCategory: (category: 'all' | ADLCategory) => void;
  onOpenPatientDetail: (patient: Patient) => void;
  onOpenNewAssessment: () => void;
  onEditPatient: (patient: Patient) => void;
  onReAssessPatient: (patient: Patient) => void;
  onPrintPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onClearAll?: () => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  patients,
  selectedVillage,
  onSelectVillage,
  selectedCategory,
  onSelectCategory,
  onOpenPatientDetail,
  onOpenNewAssessment,
  onEditPatient,
  onReAssessPatient,
  onPrintPatient,
  onDeletePatient,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [previewIdCard, setPreviewIdCard] = useState<{ name: string; photo: string } | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    // Village filter
    if (selectedVillage !== 'all' && p.villageId !== selectedVillage) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && p.currentADL?.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = `${p.prefix}${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
      const matchId = p.citizenId.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      const matchVillage = p.villageName.toLowerCase().includes(q);
      const matchAddress = `${p.houseNumber} ${p.street}`.toLowerCase().includes(q);
      const matchCaregiver = p.caregiver?.name?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchVillage && !matchAddress && !matchCaregiver) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, นามสกุล, เลขบัตร 13 หลัก, ที่อยู่, ผู้ดูแล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Village Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 shrink-0">หมู่บ้าน:</label>
            <select
              value={selectedVillage}
              onChange={(e) =>
                onSelectVillage(e.target.value === 'all' ? 'all' : (Number(e.target.value) as VillageId))
              }
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">ทั้งหมด (8 หมู่บ้าน)</option>
              {VILLAGES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.fullName}
                </option>
              ))}
            </select>

            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="มุมมองการ์ด"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="มุมมองตาราง"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {patients.length > 0 && onClearAll && (
              <button
                onClick={() => setIsConfirmClearAllOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap ml-1"
                title="ลบรายชื่อผู้ป่วยทั้งหมดออกจากระบบ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ลบทั้งหมด</span>
              </button>
            )}

            <button
              onClick={onOpenNewAssessment}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors whitespace-nowrap ml-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>เพิ่มผู้ป่วย</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทุกกลุ่ม ({patients.length})
          </button>
          <button
            onClick={() => onSelectCategory('social')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === 'social'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            ติดสังคม 12-20 ({patients.filter((p) => p.currentADL?.category === 'social').length})
          </button>
          <button
            onClick={() => onSelectCategory('homebound')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === 'homebound'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            ติดบ้าน 5-11 ({patients.filter((p) => p.currentADL?.category === 'homebound').length})
          </button>
          <button
            onClick={() => onSelectCategory('bedridden')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === 'bedridden'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            ติดเตียง 0-4 ({patients.filter((p) => p.currentADL?.category === 'bedridden').length})
          </button>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          พบข้อมูลทั้งหมด <strong className="font-mono text-slate-800">{filteredPatients.length}</strong> ราย
          {selectedVillage !== 'all' && (
            <span> ใน {VILLAGES.find((v) => v.id === selectedVillage)?.fullName}</span>
          )}
        </span>
        {filteredPatients.length < patients.length && (
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectVillage('all');
              onSelectCategory('all');
            }}
            className="text-teal-700 font-semibold hover:underline"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">ไม่พบข้อมูลผู้ป่วยที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองหมู่บ้านและกลุ่มคะแนน ADL อื่น
          </p>
          <button
            onClick={onOpenNewAssessment}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ลงทะเบียนและประเมินผู้ป่วยรายใหม่</span>
          </button>
        </div>
      )}

      {/* Card Grid View */}
      {viewMode === 'cards' && filteredPatients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((p) => {
            const adl = p.currentADL;
            const categoryBadge =
              adl.category === 'bedridden'
                ? { label: 'ติดเตียง (0-4)', color: 'text-rose-700 bg-rose-50 border-rose-200' }
                : adl.category === 'homebound'
                ? { label: 'ติดบ้าน (5-11)', color: 'text-amber-700 bg-amber-50 border-amber-200' }
                : { label: 'ติดสังคม (12-20)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };

            const hasAlerts =
              p.specialConditions.hasBedsores ||
              p.specialConditions.hasFoleyCatheter ||
              p.specialConditions.hasNGTube;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with photos and name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative shrink-0 group">
                      <img
                        src={p.patientPhoto}
                        alt={p.firstName}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewIdCard({
                            name: `${p.prefix}${p.firstName} ${p.lastName}`,
                            photo: p.idCardPhoto,
                          });
                        }}
                        title="ดูรูปหน้าบัตรประชาชน"
                        className="absolute -bottom-1 -right-1 bg-white text-teal-700 p-1 rounded-md border border-slate-200 shadow-xs hover:bg-teal-50"
                      >
                        <CreditCard className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          {p.villageName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${categoryBadge.color}`}
                        >
                          {categoryBadge.label}
                        </span>
                      </div>
                      <h3
                        onClick={() => onOpenPatientDetail(p)}
                        className="text-sm font-bold text-slate-900 hover:text-teal-700 cursor-pointer transition-colors truncate"
                      >
                        {p.prefix}{p.firstName} {p.lastName}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {p.citizenId} · อายุ {p.age} ปี ({p.gender})
                      </div>
                    </div>
                  </div>

                  {/* Address and details */}
                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 mb-3 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-medium shrink-0">ที่อยู่:</span>
                      <span className="truncate">บ้านเลขที่ {p.houseNumber} {p.street} {p.landmarks && `(${p.landmarks})`}</span>
                    </div>
                    {p.caregiver?.name && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 truncate">
                          ผู้ดูแล: {p.caregiver.name} ({p.caregiver.relationship})
                        </span>
                        {p.caregiver.phone && (
                          <a
                            href={`tel:${p.caregiver.phone}`}
                            className="text-teal-700 flex items-center gap-1 font-mono hover:underline shrink-0"
                          >
                            <Phone className="w-3 h-3" />
                            {p.caregiver.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Special flags */}
                  {hasAlerts && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.specialConditions.hasBedsores && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-medium">
                          แผลกดทับ
                        </span>
                      )}
                      {p.specialConditions.hasFoleyCatheter && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                          สายสวนปัสสาวะ
                        </span>
                      )}
                      {p.specialConditions.hasNGTube && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-medium">
                          สายให้อาหาร (NG)
                        </span>
                      )}
                    </div>
                  )}

                  {/* ADL Score Gauge */}
                  <div className="border-t border-slate-100 pt-2.5 mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">คะแนน Barthel ADL</span>
                      <span className="text-xs text-slate-400">
                        ล่าสุด: {adl.assessmentDate}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                        {adl.totalScore}
                      </span>
                      <span className="text-xs text-slate-400 font-mono"> / 20</span>
                      {adl.ltcGroup && (
                        <span className="text-[10px] block font-semibold text-slate-600">
                          กลุ่ม LTC {adl.ltcGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-1 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenPatientDetail(p)}
                      title="ดูรายละเอียดครบถ้วน"
                      className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPrintPatient(p)}
                      title="พิมพ์แบบประเมิน ADL"
                      className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditPatient(p)}
                      title="แก้ไขข้อมูลทั่วไป"
                      className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPatientToDelete(p);
                      }}
                      title="ลบข้อมูล"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onReAssessPatient(p)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ประเมินซ้ำ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredPatients.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">รูปภาพ</th>
                  <th className="py-3 px-3">ชื่อ-สกุล / เลขบัตร</th>
                  <th className="py-3 px-3">หมู่บ้าน / ที่อยู่</th>
                  <th className="py-3 px-3">อายุ</th>
                  <th className="py-3 px-3 text-center">คะแนน ADL</th>
                  <th className="py-3 px-3">การจัดกลุ่ม</th>
                  <th className="py-3 px-3">ผู้ดูแล</th>
                  <th className="py-3 px-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => {
                  const adl = p.currentADL;
                  const categoryBadge =
                    adl.category === 'bedridden'
                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                      : adl.category === 'homebound'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={p.patientPhoto}
                            alt=""
                            className="w-9 h-9 rounded object-cover border border-slate-200 cursor-pointer"
                            onClick={() => onOpenPatientDetail(p)}
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() =>
                              setPreviewIdCard({
                                name: `${p.prefix}${p.firstName} ${p.lastName}`,
                                photo: p.idCardPhoto,
                              })
                            }
                            title="ดูบัตรประชาชน"
                            className="text-slate-400 hover:text-teal-700 p-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div
                          onClick={() => onOpenPatientDetail(p)}
                          className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer"
                        >
                          {p.prefix}{p.firstName} {p.lastName}
                        </div>
                        <div className="font-mono text-slate-400 text-[11px]">{p.citizenId}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-700">{p.villageName}</div>
                        <div className="text-slate-400 text-[11px]">เลขที่ {p.houseNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {p.age} ปี ({p.gender})
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                          {adl.totalScore}
                        </span>
                        <span className="text-slate-400 text-[10px]"> / 20</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${categoryBadge}`}
                        >
                          {adl.category === 'bedridden'
                            ? 'ติดเตียง'
                            : adl.category === 'homebound'
                            ? 'ติดบ้าน'
                            : 'ติดสังคม'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-700">{p.caregiver?.name || '-'}</div>
                        <div className="font-mono text-slate-400 text-[11px]">{p.caregiver?.phone}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenPatientDetail(p)}
                            title="ดูรายละเอียด"
                            className="p-1 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintPatient(p)}
                            title="พิมพ์เอกสาร"
                            className="p-1 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onReAssessPatient(p)}
                            title="ประเมินซ้ำ"
                            className="p-1 text-teal-700 hover:bg-teal-50 rounded"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditPatient(p)}
                            title="แก้ไข"
                            className="p-1 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPatientToDelete(p)}
                            title="ลบ"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-5 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 text-center mb-1">
              ยืนยันการลบข้อมูลผู้ป่วย
            </h3>
            <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed">
              คุณต้องการลบข้อมูลของ <strong className="text-slate-900">{patientToDelete.prefix}{patientToDelete.firstName} {patientToDelete.lastName}</strong> ({patientToDelete.villageName}) ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePatient(patientToDelete.id);
                  setPatientToDelete(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {isConfirmClearAllOpen && onClearAll && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-5 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 text-center mb-1">
              ยืนยันการลบรายชื่อผู้ป่วยทั้งหมด
            </h3>
            <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed">
              คุณต้องการลบรายชื่อผู้ป่วยทั้งหมดจำนวน <strong className="text-slate-900">{patients.length} ราย</strong> ออกจากระบบและฐานข้อมูลออนไลน์ใช่หรือไม่?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setIsConfirmClearAllOpen(false);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                ยืนยันลบทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Lightbox Modal */}
      {previewIdCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">รูปถ่ายหน้าบัตรประชาชน</h4>
                <p className="text-xs text-slate-500">{previewIdCard.name}</p>
              </div>
              <button
                onClick={() => setPreviewIdCard(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕ ปิด
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center">
              <img
                src={previewIdCard.photo}
                alt="ID Card"
                className="max-h-80 w-auto rounded-lg shadow-sm border border-slate-200"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3 bg-white text-right">
              <button
                onClick={() => setPreviewIdCard(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
