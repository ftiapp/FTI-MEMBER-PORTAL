// ค้นหาด้วยชื่อบริษัทหรือ MEMBER_CODE
"use client";

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        className="w-full border rounded p-2 text-black"
        placeholder={placeholder || "ค้นหาด้วยชื่อบริษัทหรือรหัสสมาชิก"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={2}
      />
    </div>
  );
}
