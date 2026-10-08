import React, { useState } from 'react';
import { Patient } from '../types';
import { ADL_QUESTIONS } from '../constants/villages';
import { formatThaiDate } from '../utils/adlCalculator';
import { storageService } from '../services/storageService';
import { Printer, ArrowLeft, Download, Check } from 'lucide-react';

interface PrintReportViewProps {
  patient: Patient | null;
  onBack: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ patient, onBack }) => {
  const [isExported, setIsExported] = useState(false);

  if (!patient) return null;

  const adl = patient.currentADL;
  const isBedridden = adl?.category === 'bedridden';
  const isHomebound = adl?.category === 'homebound';

  const categoryLabel = isBedridden
    ? 'กลุ่มที่ 3 : ติดเตียง (0 - 4 คะแนน)'
    : isHomebound
    ? 'กลุ่มที่ 2 : ติดบ้าน (5 - 11 คะแนน)'
    : 'กลุ่มที่ 1 : ติดสังคม (12 - 20 คะแนน)';

  const handleExportExcel = () => {
    storageService.exportSinglePatientToExcel(patient);
    setIsExported(true);
    setTimeout(() => setIsExported(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top action bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้ารายชื่อ</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
          >
            {isExported ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-emerald-600" />}
            <span>{isExported ? 'ดาวน์โหลดแล้ว' : 'ส่งออกเป็น Excel'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์เอกสาร (Print)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 layout in Thai font) */}
      <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 font-['Sarabun',sans-serif] text-slate-900 text-sm leading-normal">
        {/* Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 mb-6 space-y-1">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight">
            แบบประเมินความสามารถในการดำเนินชีวิตประจำวัน
          </h1>
          <h2 className="text-base font-semibold">
            ดัชนีบาร์เธลเอดีแอล (Barthel Activities of Daily Living : ADL)
          </h2>
          <p className="text-xs text-slate-600">
            โครงการสนับสนุนการจัดบริการดูแลระยะยาวด้านสาธารณสุขสำหรับผู้สูงอายุที่มีภาวะพึ่งพิง (Long Term Care - LTC)
          </p>
          <p className="text-xs font-medium text-slate-700">
            สังกัด: {adl?.evaluatorAgency || 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านธาตุ'} · เขตบริการ 8 หมู่บ้าน
          </p>
        </div>

        {/* Section 1: Patient Bio & Photos */}
        <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-slate-300">
          {/* Bio Data (Left 2 Columns) */}
          <div className="col-span-2 space-y-2 text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">
              ส่วนที่ 1: ข้อมูลผู้ป่วยและที่อยู่อาศัย
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
              <div>
                <span className="text-slate-600">ชื่อ - สกุล: </span>
                <strong className="text-slate-900 text-sm">
                  {patient.prefix}{patient.firstName} {patient.lastName}
                </strong>
              </div>
              <div>
                <span className="text-slate-600">เลขประจำตัวประชาชน: </span>
                <strong className="font-mono">{patient.citizenId}</strong>
              </div>
              <div>
                <span className="text-slate-600">วัน/เดือน/ปีเกิด: </span>
                <span>{formatThaiDate(patient.birthDate)}</span>
              </div>
              <div>
                <span className="text-slate-600">อายุ: </span>
                <span>{patient.age} ปี (เพศ {patient.gender})</span>
              </div>
              <div>
                <span className="text-slate-600">สิทธิการรักษา: </span>
                <span>{patient.healthRights}</span>
              </div>
              <div>
                <span className="text-slate-600">เบอร์โทรศัพท์: </span>
                <span className="font-mono">{patient.phone || '-'}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-slate-600">ที่อยู่: </span>
              <span>
                บ้านเลขที่ {patient.houseNumber} {patient.street} <strong>{patient.villageName}</strong> {patient.subdistrict} {patient.district} {patient.province}
              </span>
            </div>

            <div>
              <span className="text-slate-600">จุดสังเกตที่ตั้งบ้าน: </span>
              <span>{patient.landmarks || '-'}</span>
            </div>

            <div className="pt-1">
              <span className="text-slate-600">ผู้ดูแลหลัก (Caregiver): </span>
              <strong>{patient.caregiver?.name || '-'}</strong> ({patient.caregiver?.relationship || '-'})
              {patient.caregiver?.phone && (
                <span className="font-mono ml-2">โทร. {patient.caregiver.phone}</span>
              )}
            </div>

            <div>
              <span className="text-slate-600">โรคประจำตัว: </span>
              <span>{patient.chronicDiseases?.join(', ') || 'ไม่มี'}</span>
            </div>
          </div>

          {/* Photos (Right 1 Column) */}
          <div className="space-y-3">
            {/* Patient Portrait */}
            <div className="text-center">
              <div className="w-28 h-28 mx-auto border border-slate-300 rounded overflow-hidden bg-slate-50 flex items-center justify-center">
                <img
                  src={patient.patientPhoto}
                  alt={patient.firstName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">ภาพถ่ายผู้ป่วย</span>
            </div>

            {/* Thai ID Card */}
            <div className="text-center">
              <div className="w-36 h-22 mx-auto border border-slate-300 rounded overflow-hidden bg-slate-50 flex items-center justify-center">
                <img
                  src={patient.idCardPhoto}
                  alt="ID Card"
                  className="w-full h-full object-contain p-0.5"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">ภาพถ่ายหน้าบัตรประชาชน</span>
            </div>
          </div>
        </div>

        {/* Section 2: Barthel ADL 10-Item Evaluation Table */}
        <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              ส่วนที่ 2: ผลการประเมิน 10 กิจวัตรประจำวันตามดัชนีบาร์เธลเอดีแอล
            </h3>
            <span className="text-xs font-mono font-bold text-slate-700">
              วันที่ประเมิน: {formatThaiDate(adl?.assessmentDate || '')}
            </span>
          </div>

          <table className="w-full border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900">
                <th className="border border-slate-300 py-1.5 px-2 text-center w-10">ข้อ</th>
                <th className="border border-slate-300 py-1.5 px-3 text-left">กิจกรรมกิจวัตรประจำวัน (Activities)</th>
                <th className="border border-slate-300 py-1.5 px-3 text-left">ระดับความสามารถที่ประเมินได้</th>
                <th className="border border-slate-300 py-1.5 px-2 text-center w-20">คะแนนที่ได้</th>
                <th className="border border-slate-300 py-1.5 px-2 text-center w-20">คะแนนเต็ม</th>
              </tr>
            </thead>
            <tbody>
              {ADL_QUESTIONS.map((q) => {
                const score = adl?.answers ? adl.answers[q.key] : 0;
                const chosen = q.options.find((o) => o.score === score);

                return (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 py-1 px-2 text-center font-mono">{q.number}</td>
                    <td className="border border-slate-300 py-1 px-3 font-semibold text-slate-800">
                      {q.title.split('(')[0].trim()}
                    </td>
                    <td className="border border-slate-300 py-1 px-3 text-slate-700">
                      {chosen?.description}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-center font-mono font-bold text-slate-900">
                      {score}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-center font-mono text-slate-500">
                      {q.maxScore}
                    </td>
                  </tr>
                );
              })}
              {/* Total Row */}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={3} className="border border-slate-300 py-2 px-3 text-right">
                  คะแนนรวมทั้งสิ้น (Total ADL Score)
                </td>
                <td className="border border-slate-300 py-2 px-2 text-center font-mono text-base text-slate-900">
                  {adl?.totalScore}
                </td>
                <td className="border border-slate-300 py-2 px-2 text-center font-mono text-slate-600">
                  20
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Classification & Care Plan */}
        <div className="mb-6 pb-6 border-b border-slate-300 space-y-3 text-xs">
          <h3 className="font-bold text-sm text-slate-900">
            ส่วนที่ 3: การแปลผลและการจัดกลุ่มภาวะพึ่งพิง (LTC Classification)
          </h3>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-300 rounded">
            <div>
              <span className="text-slate-600 block">การจัดกลุ่มตามเกณฑ์กระทรวงสาธารณสุข:</span>
              <strong className="text-sm text-slate-900 block mt-0.5">
                {categoryLabel}
              </strong>
            </div>
            <div>
              <span className="text-slate-600 block">เกณฑ์กลุ่ม LTC (สปสช. / กรมอนามัย):</span>
              <strong className="text-sm text-slate-900 block mt-0.5">
                กลุ่มที่ {adl?.ltcGroup || 1}
              </strong>
            </div>
          </div>

          {adl?.suggestedEquipments && adl.suggestedEquipments.length > 0 && (
            <div>
              <span className="text-slate-700 font-bold block mb-1">อุปกรณ์และกายอุปกรณ์ที่จัดสรร/แนะนำ:</span>
              <p className="text-slate-800">{adl.suggestedEquipments.join(', ')}</p>
            </div>
          )}

          {adl?.clinicalNotes && (
            <div>
              <span className="text-slate-700 font-bold block mb-1">บันทึกเพิ่มเติมของผู้ประเมิน:</span>
              <p className="text-slate-800">{adl.clinicalNotes}</p>
            </div>
          )}
        </div>

        {/* Section 4: Signatures */}
        <div className="grid grid-cols-3 gap-6 pt-4 text-xs text-center">
          <div className="space-y-8">
            <p className="text-slate-700">ลงชื่อ........................................................</p>
            <div>
              <p className="font-semibold text-slate-900">({adl?.evaluatorName || '...................................................'})</p>
              <p className="text-slate-500">ผู้ประเมิน / {adl?.evaluatorRole || 'เจ้าหน้าที่'}</p>
              <p className="text-slate-500 font-mono mt-0.5">วันที่ {formatThaiDate(adl?.assessmentDate || '')}</p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-slate-700">ลงชื่อ........................................................</p>
            <div>
              <p className="font-semibold text-slate-900">(นางสาวพัชราภรณ์ สุขใจ)</p>
              <p className="text-slate-500">ผู้จัดการการดูแล (Care Manager)</p>
              <p className="text-slate-500 font-mono mt-0.5">วันที่ {formatThaiDate(adl?.assessmentDate || '')}</p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-slate-700">ลงชื่อ........................................................</p>
            <div>
              <p className="font-semibold text-slate-900">(นายแพทย์ / ผอ. รพ.สต.)</p>
              <p className="text-slate-500">ผู้อนุมัติแผนการดูแล (Care Plan)</p>
              <p className="text-slate-500 font-mono mt-0.5">วันที่ {formatThaiDate(adl?.assessmentDate || '')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
