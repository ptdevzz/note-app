# Project Rules & Customizations for UsWeekends

## Command Execution & Approval
- NEVER run `yarn build`, `git add`, `git commit`, or `git push` automatically after editing code files.
- Only modify code files locally and let the user test or request build/commit manually when needed.
- Preserve custom Vietnamese dual-passcode architecture, PWA push notifications, and Firebase Realtime listeners.

## Code Architecture & Code Style Guidelines
- **Custom Hooks Isolation (`src/hooks/`)**: Tách biệt toàn bộ logic xử lý state phức tạp, side-effects, Firebase Realtime/Firestore listeners, presence, và notification setup thành các custom hooks riêng biệt.
- **Component Modularization (`src/components/`)**: Chia nhỏ giao diện theo từng Tab hoặc Widget độc lập (ví dụ `HomeTab.tsx`, `PlanTab.tsx`, `WeekendQuickBanner.tsx`, `PrivilegesPage.tsx`). Component giao diện không ôm đồm logic kết nối dữ liệu trực tiếp.
- **Thin Orchestrator (`src/app/page.tsx`)**: Trang chính đóng vai trò như một Router/Container gọn nhẹ, tập trung gọi các custom hooks và render các sub-components.
- **Server Utilities (`src/lib/server/`)**: Tách riêng logic xử lý server-only (ví dụ YouTube audio extractor, cache helpers, API route services).
- **Constants & Helpers (`src/lib/`)**: Quản lý enum, role utilities, date formatters và hằng số dùng chung ở thư mục `src/lib/`.

