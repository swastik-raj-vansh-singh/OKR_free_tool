module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/user/reminder-settings/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function POST(req) {
    try {
        console.log('[REMINDER_SETTINGS] API called');
        const body = await req.json();
        console.log('[REMINDER_SETTINGS] Request body:', body);
        const { user_id, reminder_enabled, reminder_frequency, reminder_day, reminder_time } = body;
        // Validate required fields
        if (!user_id) {
            console.error('[REMINDER_SETTINGS] user_id is missing');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'user_id is required'
            }, {
                status: 400
            });
        }
        // Get database URL from environment
        const databaseUrl = process.env.DATABASE_URL;
        const supabaseUrl = ("TURBOPACK compile-time value", "https://sifdupidllgjufjcrkwi.supabase.co");
        const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZmR1cGlkbGxnanVmamNya3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzYxNjQsImV4cCI6MjA4MTMxMjE2NH0.wmdDpSORULqj92RIHbulTMQEQc8nXioBignpyVdTAG0");
        console.log('[REMINDER_SETTINGS] Environment check:', {
            hasDatabaseUrl: !!databaseUrl,
            hasSupabaseUrl: !!supabaseUrl,
            hasSupabaseKey: !!supabaseAnonKey
        });
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Import postgres client dynamically to avoid bundling issues
        const { createClient } = await __turbopack_context__.A("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript, async loader)");
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        // Update user reminder settings
        // Note: Using 'id' column instead of 'user_id' based on Supabase schema
        const { data, error } = await supabase.from('users').update({
            reminder_enabled: reminder_enabled ?? true,
            reminder_frequency: reminder_frequency ?? 'weekly',
            reminder_day: reminder_day ?? 'monday',
            reminder_time: reminder_time ?? '18:00:00'
        }).eq('id', user_id).select();
        if (error) {
            console.error('[REMINDER_SETTINGS] Database error:', JSON.stringify(error, null, 2));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to update reminder settings',
                details: error.message,
                hint: error.hint,
                code: error.code
            }, {
                status: 500
            });
        }
        console.log('[REMINDER_SETTINGS] Successfully updated for user:', user_id);
        console.log('[REMINDER_SETTINGS] Updated data:', data);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Reminder settings updated successfully',
            data: data?.[0] || null
        });
    } catch (error) {
        console.error('[REMINDER_SETTINGS] Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update reminder settings'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__65ba67b6._.js.map