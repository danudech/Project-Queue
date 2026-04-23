import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Building2, Store, CalendarDays, Phone, Briefcase } from "lucide-react"; // เพิ่ม Icon เพื่อความสวยงาม

const CreateStoreModernForm = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-3xl shadow-lg border border-slate-100">
      
      {/* Header with Icon */}
      <div className="mb-12 flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="p-4 bg-indigo-100 rounded-xl text-indigo-700">
          <Building2 className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            สร้างร้านค้าใหม่
          </h2>
          <p className="text-slate-600 mt-1">
            เริ่มต้นใช้งาน QueueApp ง่ายๆ เพียงกรอกข้อมูลเบื้องต้น
          </p>
        </div>
      </div>

      {/* Modern Stepper */}
      <div className="grid grid-cols-3 gap-6 mb-12 p-2 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg ring-4 ring-indigo-100">
            1
          </div>
          <div>
            <span className="block text-sm text-slate-500">ขั้นตอนที่ 1</span>
            <span className="block font-semibold text-indigo-900">ข้อมูลร้าน</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full border-2 border-slate-300 bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <div>
            <span className="block text-sm text-slate-500">ขั้นตอนที่ 2</span>
            <span className="block font-semibold text-slate-800">สาขาแรก</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full border-2 border-slate-300 bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <div>
            <span className="block text-sm text-slate-500">ขั้นตอนที่ 3</span>
            <span className="block font-semibold text-slate-800">เวลาทำการ</span>
          </div>
        </div>
      </div>

      {/* Separator */}
      <hr className="border-slate-100 mb-12" />

      {/* Form Content */}
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
        
        {/* ชื่อร้านค้า */}
        <div className="space-y-3 col-span-2">
          <Label htmlFor="store-name" className="text-base font-medium text-slate-800 flex items-center gap-2">
            <Store className="w-5 h-5 text-slate-500" />
            ชื่อร้านค้า <span className="text-destructive font-bold">*</span>
          </Label>
          <Input 
            id="store-name" 
            placeholder="เช่น คลินิกสุขภาพดี, ร้านตัดผม The Cut" 
            className="h-14 px-5 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 rounded-xl"
          />
          <p className="text-sm text-slate-500 font-normal ml-1">ชื่อที่ลูกค้าจะเห็นเมื่อมาจองคิว</p>
        </div>

        {/* ประเภทธุรกิจ */}
        <div className="space-y-3">
          <Label htmlFor="business-type" className="text-base font-medium text-slate-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-500" />
            ประเภทธุรกิจ <span className="text-destructive font-bold">*</span>
          </Label>
          <Select>
            <SelectTrigger id="business-type" className="h-14 px-5 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 rounded-xl">
              <SelectValue placeholder="เลือกประเภทธุรกิจ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clinic">คลินิก / สุขภาพ / โรงพยาบาล</SelectItem>
              <SelectItem value="salon">เสริมสวย / ตัดผม / ทำเล็บ</SelectItem>
              <SelectItem value="restaurant">ร้านอาหาร / คาเฟ่ / เบเกอรี่</SelectItem>
              <SelectItem value="other">อื่นๆ / บริการทั่วไป</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-slate-500 font-normal ml-1">ใช้ตั้งค่าเริ่มต้นที่เหมาะสม</p>
        </div>

        {/* เบอร์โทรศัพท์ร้าน */}
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-base font-medium text-slate-800 flex items-center gap-2">
            <Phone className="w-5 h-5 text-slate-500" />
            เบอร์โทรร้าน
          </Label>
          <Input 
            id="phone" 
            type="tel"
            placeholder="เช่น 02-123-4567 หรือ 081-234-5678" 
            className="h-14 px-5 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 rounded-xl"
          />
          <p className="text-sm text-slate-500 font-normal ml-1">เพื่อให้ลูกค้าติดต่อสอบถามเพิ่มเติมได้</p>
        </div>
      </div>

      {/* Separator */}
      <hr className="border-slate-100 my-12" />

      {/* Footer Buttons */}
      <div className="flex items-center justify-between gap-4 mt-10">
        <Button variant="ghost" className="px-10 h-14 rounded-xl text-slate-600 hover:bg-slate-50">
          ยกเลิก
        </Button>
        <Button className="px-12 h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold shadow-md transition-all group">
          ดำเนินการต่อ
          <span className="ml-2 transition-transform group-hover:translate-x-1.5">→</span>
        </Button>
      </div>
    </div>
  );
};

export default CreateStoreModernForm;