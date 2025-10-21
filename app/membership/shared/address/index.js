/**
 * Address Components - Shared components for address management
 *
 * ไฟล์นี้ export components และ utilities ทั้งหมดที่เกี่ยวข้องกับการจัดการที่อยู่
 * เพื่อให้สามารถนำไปใช้ในส่วนต่างๆ ของระบบได้
 */

// Main Component
export { default as AddressSection } from "./AddressSection";

// Sub Components
export { default as AddressFields } from "./AddressFields";
export { default as AddressLocationFields } from "./AddressLocationFields";
export { default as AddressContactFields } from "./AddressContactFields";
export { default as AddressTabNavigation } from "./AddressTabNavigation";

// Custom Hook
export { default as useAddressHandlers } from "./useAddressHandlers";

// Utilities
export * from "./addressUtils";
