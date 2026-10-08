import React from 'react';
import { Patient, VillageId } from '../types';
import { VILLAGES } from '../constants/villages';
import { MapPin, Users, HeartPulse, Home, Bed, ArrowRight, ShieldCheck, Download } from 'lucide-react';

interface VillagesReportViewProps {
  patients: Patient[];
  onSelectVillageAndFilter: (villageId: VillageId) => void;
  onExportCSV: () => void;
}

export const VillagesReportView: React.FC<VillagesReportViewProps> = ({
  patients,
  onSelectVillageAndFilter,
  onExportCSV,
}) => {
  const totalAll = patients.length;

  const villageData = VILLAGES.map((v) => {
    const list = patients.filter((p) => p.villageId === v.id);
    const social = list.filter((p) => p.currentADL?.category === 'social').length;
    const homebound = list.filter((p) => p.currentADL?.category === 'homebound').length;
    const bedridden = list.filter((p) => p.currentADL?.category === 'bedridden').length;
    const bedsore = list.filter((p) => p.specialConditions?.hasBedsores).length;
    const catheter = list.filter((p) => p.specialConditions?.hasFoleyCatheter).length;
    const ngTube = list.filter((p) => p.specialConditions?.hasNGTube).length;

    return {
      village: v,
      patients: list,
      total: list.length,
      social,
      homebound,
      bedridden,
      bedsore,
      catheter,
      ngTube,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block mb-1">
            รายงานวิเคราะห์ข้อมูลเชิงพื้นที่
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            สรุปข้อมูลผู้ป่วยที่มีภาวะพึ่งพิงแยกราย 8 หมู่บ้าน
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            เพื่อใช้สนับสนุนการวางแผนงบประมาณกองทุนหลักประกันสุขภาพตำบล (LTC) และจัดสรรผู้ช่วยดูแลผู้สูงอายุ (Caregiver)
          </p>
        </div>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>ดาวน์โหลดรายงานสรุป (CSV)</span>
        </button>
      </div>

      {/* 8 Villages Comprehensive Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            ตารางเปรียบเทียบสถิติ 8 หมู่บ้านในเขตรับผิดชอบ
          </h3>
          <span className="text-xs font-mono font-bold text-slate-600">
            รวมทั้งสิ้น {totalAll} ราย
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">หมู่บ้าน</th>
                <th className="py-3 px-3 text-center">รวม (คน)</th>
                <th className="py-3 px-3 text-center text-emerald-800">ติดสังคม (12-20)</th>
                <th className="py-3 px-3 text-center text-amber-800">ติดบ้าน (5-11)</th>
                <th className="py-3 px-3 text-center text-rose-800">ติดเตียง (0-4)</th>
                <th className="py-3 px-3 text-center">มีแผลกดทับ</th>
                <th className="py-3 px-3 text-center">คาสายสวน</th>
                <th className="py-3 px-3 text-left">ประธาน อสม. ประจำหมู่</th>
                <th className="py-3 px-4 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {villageData.map((item) => {
                return (
                  <tr key={item.village.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{item.village.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 tabular-nums">
                      {item.total}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-700 tabular-nums">
                      {item.social}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-700 tabular-nums">
                      {item.homebound}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          item.bedridden > 0 ? 'bg-rose-100 text-rose-800' : 'text-slate-400'
                        }`}
                      >
                        {item.bedridden}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums">
                      <span className={item.bedsore > 0 ? 'text-rose-700 font-bold' : 'text-slate-400'}>
                        {item.bedsore}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums">
                      <span className={item.catheter > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                        {item.catheter}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] truncate max-w-xs">
                      {item.village.volunteerLeader}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectVillageAndFilter(item.village.id)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 ml-auto"
                      >
                        <span>ดูรายชื่อ</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid of 8 Villages with Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {villageData.map((item) => (
          <div
            key={item.village.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="text-xs font-bold text-slate-900">{item.village.fullName}</span>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {item.total} ราย
                </span>
              </div>

              <div className="space-y-2 text-xs mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ติดสังคม (12-20):</span>
                  <span className="font-mono font-semibold text-emerald-700">{item.social} คน</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ติดบ้าน (5-11):</span>
                  <span className="font-mono font-semibold text-amber-700">{item.homebound} คน</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ติดเตียง (0-4):</span>
                  <span className="font-mono font-bold text-rose-700">{item.bedridden} คน</span>
                </div>
                {item.bedsore > 0 && (
                  <div className="flex items-center justify-between text-rose-800 bg-rose-50 p-1 rounded font-medium text-[11px]">
                    <span>แผลกดทับที่ต้องทำแผล:</span>
                    <span className="font-mono font-bold">{item.bedsore} คน</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 italic mb-3">
                {item.village.volunteerLeader}
              </p>
            </div>

            <button
              onClick={() => onSelectVillageAndFilter(item.village.id)}
              className="w-full py-1.5 px-3 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>เปิดดูทะเบียนผู้ป่วยหมู่นี้</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
