import React from 'react';
import { Patient, VillageId } from '../types';
import { VILLAGES } from '../constants/villages';
import { Users, HeartPulse, Home, Bed, AlertTriangle, ArrowRight, Activity, MapPin } from 'lucide-react';

interface DashboardViewProps {
  patients: Patient[];
  onSelectVillage: (villageId: VillageId | 'all') => void;
  onSelectCategory: (category: 'all' | 'social' | 'homebound' | 'bedridden') => void;
  onOpenPatientDetail: (patient: Patient) => void;
  onOpenNewAssessment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  onSelectVillage,
  onSelectCategory,
  onOpenPatientDetail,
  onOpenNewAssessment,
}) => {
  const total = patients.length;

  const socialCount = patients.filter((p) => p.currentADL?.category === 'social').length;
  const homeboundCount = patients.filter((p) => p.currentADL?.category === 'homebound').length;
  const bedriddenCount = patients.filter((p) => p.currentADL?.category === 'bedridden').length;

  const bedsoreCount = patients.filter((p) => p.specialConditions?.hasBedsores).length;
  const foleyCount = patients.filter((p) => p.specialConditions?.hasFoleyCatheter).length;
  const ngTubeCount = patients.filter((p) => p.specialConditions?.hasNGTube).length;

  // Village analytics
  const villageStats = VILLAGES.map((v) => {
    const list = patients.filter((p) => p.villageId === v.id);
    const social = list.filter((p) => p.currentADL?.category === 'social').length;
    const homebound = list.filter((p) => p.currentADL?.category === 'homebound').length;
    const bedridden = list.filter((p) => p.currentADL?.category === 'bedridden').length;
    return {
      village: v,
      total: list.length,
      social,
      homebound,
      bedridden,
    };
  });

  // Recent assessments
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome context */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-800 rounded-2xl text-white p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <span className="text-teal-300 text-xs font-semibold tracking-wider uppercase mb-1 block">
            โครงการดูแลผู้มีภาวะพึ่งพิงระยะยาว (Long Term Care - LTC)
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-white">
            ระบบคัดกรองและประเมิน Barthel ADL Index 8 หมู่บ้าน
          </h1>
          <p className="text-slate-200 text-sm leading-relaxed mb-4">
            บันทึกข้อมูลผู้ป่วย ภาพถ่ายบัตรประชาชน ภาพถ่ายผู้ป่วย ประเมิน 10 กิจวัตรประจำวัน 
            เพื่อคัดกรองจัดกลุ่ม ติดสังคม ติดบ้าน ติดเตียง และวางแผนการดูแลช่วยเหลือชุมชน
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              ครอบคลุม หมู่ 1 - หมู่ 8
            </span>
            <span aria-hidden="true">·</span>
            <span>เกณฑ์กระทรวงสาธารณสุข & กรมอนามัย</span>
            <span aria-hidden="true">·</span>
            <span>ปรับปรุงข้อมูลล่าสุด วันนี้</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div 
          onClick={() => onSelectCategory('all')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">ผู้ป่วยที่ลงทะเบียนทั้งหมด</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">คน</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>ครอบคลุม 8 หมู่บ้าน</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Social Card (12-20) */}
        <div 
          onClick={() => onSelectCategory('social')}
          className="bg-white p-5 rounded-xl border border-emerald-200 hover:border-emerald-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-emerald-800 block">กลุ่มที่ 1 : ติดสังคม</span>
              <span className="text-[11px] text-slate-500">12 - 20 คะแนน (พึ่งพาตนเองได้)</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-emerald-700">{socialCount}</span>
            <span className="text-xs text-slate-500">คน ({total ? Math.round((socialCount / total) * 100) : 0}%)</span>
          </div>
          <p className="text-xs text-emerald-600 mt-2 flex items-center justify-between font-medium">
            <span>ส่งเสริมสุขภาพ & ป้องกันเสื่อม</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Homebound Card (5-11) */}
        <div 
          onClick={() => onSelectCategory('homebound')}
          className="bg-white p-5 rounded-xl border border-amber-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-amber-800 block">กลุ่มที่ 2 : ติดบ้าน</span>
              <span className="text-[11px] text-slate-500">5 - 11 คะแนน (พึ่งพาปานกลาง)</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-amber-700">{homeboundCount}</span>
            <span className="text-xs text-slate-500">คน ({total ? Math.round((homeboundCount / total) * 100) : 0}%)</span>
          </div>
          <p className="text-xs text-amber-600 mt-2 flex items-center justify-between font-medium">
            <span>ต้องการผู้ช่วยดูแล & กายภาพ</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Bedridden Card (0-4) */}
        <div 
          onClick={() => onSelectCategory('bedridden')}
          className="bg-white p-5 rounded-xl border border-rose-200 hover:border-rose-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-rose-800 block">กลุ่มที่ 3 : ติดเตียง</span>
              <span className="text-[11px] text-slate-500">0 - 4 คะแนน (พึ่งพิงสูง)</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <Bed className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-rose-700">{bedriddenCount}</span>
            <span className="text-xs text-slate-500">คน ({total ? Math.round((bedriddenCount / total) * 100) : 0}%)</span>
          </div>
          <p className="text-xs text-rose-600 mt-2 flex items-center justify-between font-medium">
            <span>เฝ้าระวังแผลกดทับ & เยี่ยมบ้าน</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </div>

      {/* Special Medical Conditions Alert Row */}
      {(bedsoreCount > 0 || foleyCount > 0 || ngTubeCount > 0) && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-amber-900">
                รายการภาวะแทรกซ้อนทางการแพทย์ที่ต้องเฝ้าระวังใกล้ชิด (High Risk Monitoring)
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-800 mt-0.5">
                <span>มีแผลกดทับ: <strong className="font-mono tabular-nums">{bedsoreCount}</strong> ราย</span>
                <span aria-hidden="true">·</span>
                <span>คาสายสวนปัสสาวะ: <strong className="font-mono tabular-nums">{foleyCount}</strong> ราย</span>
                <span aria-hidden="true">·</span>
                <span>ให้อาหารทางสายยาง (NG Tube): <strong className="font-mono tabular-nums">{ngTubeCount}</strong> ราย</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectCategory('bedridden')}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-4 shrink-0"
          >
            ดูรายชื่อผู้ป่วยติดเตียง &gt;
          </button>
        </div>
      )}

      {/* Village Breakdown Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              สถิติแยกตามรายหมู่บ้าน (8 หมู่บ้าน)
            </h2>
            <p className="text-xs text-slate-500">
              คลิกที่หมู่บ้านเพื่อกรองดูรายชื่อและรายละเอียดผู้ป่วยในแต่ละหมู่
            </p>
          </div>
          <button
            onClick={() => onSelectVillage('all')}
            className="text-xs text-teal-700 font-semibold hover:underline self-start sm:self-auto"
          >
            ดูทั้งหมด ({total} คน)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {villageStats.map((item) => {
            const hasBedridden = item.bedridden > 0;
            return (
              <div
                key={item.village.id}
                onClick={() => onSelectVillage(item.village.id)}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {item.village.fullName}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.total} คน
                  </span>
                </div>

                {/* Progress bar proportion */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex mb-2.5">
                  {item.total > 0 ? (
                    <>
                      <div
                        style={{ width: `${(item.social / item.total) * 100}%` }}
                        className="bg-emerald-500 h-full"
                        title={`ติดสังคม ${item.social}`}
                      />
                      <div
                        style={{ width: `${(item.homebound / item.total) * 100}%` }}
                        className="bg-amber-500 h-full"
                        title={`ติดบ้าน ${item.homebound}`}
                      />
                      <div
                        style={{ width: `${(item.bedridden / item.total) * 100}%` }}
                        className="bg-rose-500 h-full"
                        title={`ติดเตียง ${item.bedridden}`}
                      />
                    </>
                  ) : (
                    <div className="bg-slate-200 w-full h-full" />
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="text-emerald-700">สังคม: {item.social}</span>
                  <span className="text-amber-700">บ้าน: {item.homebound}</span>
                  <span className={hasBedridden ? 'text-rose-700 font-bold' : 'text-slate-400'}>
                    เตียง: {item.bedridden}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Evaluations Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              การประเมินล่าสุดในระบบ
            </h2>
            <p className="text-xs text-slate-500">
              ผู้ป่วยที่ได้รับการประเมินและอัปเดตข้อมูลภาวะพึ่งพิง
            </p>
          </div>
          <button
            onClick={onOpenNewAssessment}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>+ บันทึกเพิ่ม</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentPatients.map((p) => {
            const adl = p.currentADL;
            const categoryBadge =
              adl.category === 'bedridden'
                ? { label: 'ติดเตียง (0-4)', color: 'text-rose-700 bg-rose-50 border-rose-200' }
                : adl.category === 'homebound'
                ? { label: 'ติดบ้าน (5-11)', color: 'text-amber-700 bg-amber-50 border-amber-200' }
                : { label: 'ติดสังคม (12-20)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };

            return (
              <div
                key={p.id}
                onClick={() => onOpenPatientDetail(p)}
                className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.patientPhoto}
                    alt={p.firstName}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {p.prefix}{p.firstName} {p.lastName}
                      </span>
                      <span className="text-xs text-slate-500">
                        (อายุ {p.age} ปี)
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 mt-0.5">
                      <span className="font-medium text-slate-700">{p.villageName}</span>
                      <span aria-hidden="true">·</span>
                      <span>ประเมินเมื่อ {adl.assessmentDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>ผู้ประเมิน: {adl.evaluatorName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      คะแนน {adl.totalScore}/20
                    </span>
                    <span
                      className={`block text-[11px] font-semibold px-2 py-0.5 rounded border mt-0.5 ${categoryBadge.color}`}
                    >
                      {categoryBadge.label}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
