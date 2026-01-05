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
"[project]/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Supabase Client Configuration
 * Provides database access for OKR application
 */ __turbopack_context__.s([
    "acceptInvitation",
    ()=>acceptInvitation,
    "supabase",
    ()=>supabase,
    "updateDraftOKRs",
    ()=>updateDraftOKRs,
    "validateInvitationToken",
    ()=>validateInvitationToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
// Initialize Supabase client
const supabaseUrl = ("TURBOPACK compile-time value", "https://sifdupidllgjufjcrkwi.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZmR1cGlkbGxnanVmamNya3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzYxNjQsImV4cCI6MjA4MTMxMjE2NH0.wmdDpSORULqj92RIHbulTMQEQc8nXioBignpyVdTAG0");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
async function validateInvitationToken(token) {
    try {
        // Fetch user by invitation token
        const { data: user, error: userError } = await supabase.from('users').select('*').eq('invitation_token', token).single();
        if (userError || !user) {
            console.error('User not found for token:', token);
            return null;
        }
        // Check if invitation is already accepted
        if (user.invitation_accepted_at) {
            return null;
        }
        // Fetch user's OKRs
        const { data: okr, error: okrError } = await supabase.from('okr_generations').select('*').eq('user_id', user.id).eq('is_draft', true).single();
        if (okrError || !okr) {
            console.error('OKR not found for user:', user.id);
            return null;
        }
        // Fetch leader info (optional)
        let leader = null;
        if (user.invited_by) {
            const { data: leaderData, error: leaderError } = await supabase.from('users').select('name, email').eq('id', user.invited_by).single();
            if (!leaderError && leaderData) {
                leader = leaderData;
            }
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                invitation_token: user.invitation_token,
                invitation_sent_at: user.invitation_sent_at,
                invitation_accepted_at: user.invitation_accepted_at
            },
            okr: {
                id: okr.id,
                user_id: okr.user_id,
                website_url: okr.website_url,
                company_name: okr.company_name,
                planning_period: okr.planning_period,
                strategic_narrative: okr.strategic_narrative,
                okrs: okr.okrs,
                is_draft: okr.is_draft,
                created_at: okr.created_at
            },
            leader
        };
    } catch (error) {
        console.error('Error validating invitation token:', error);
        return null;
    }
}
async function acceptInvitation(token) {
    try {
        // Get user by token
        const { data: user, error: userError } = await supabase.from('users').select('id').eq('invitation_token', token).single();
        if (userError || !user) {
            return {
                success: false,
                message: 'Invalid invitation token'
            };
        }
        // Check if already accepted
        const { data: existingUser } = await supabase.from('users').select('invitation_accepted_at').eq('id', user.id).single();
        if (existingUser?.invitation_accepted_at) {
            return {
                success: false,
                message: 'Invitation already accepted'
            };
        }
        // Update user: mark invitation as accepted
        const { error: updateUserError } = await supabase.from('users').update({
            invitation_accepted_at: new Date().toISOString()
        }).eq('id', user.id);
        if (updateUserError) {
            console.error('Error updating user:', updateUserError);
            return {
                success: false,
                message: 'Failed to accept invitation'
            };
        }
        // Update OKR: mark as finalized (not draft)
        const { error: updateOkrError } = await supabase.from('okr_generations').update({
            is_draft: false
        }).eq('user_id', user.id);
        if (updateOkrError) {
            console.error('Error updating OKR:', updateOkrError);
            return {
                success: false,
                message: 'Failed to finalize OKRs'
            };
        }
        return {
            success: true,
            message: 'Invitation accepted successfully'
        };
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return {
            success: false,
            message: 'An error occurred while accepting the invitation'
        };
    }
}
async function updateDraftOKRs(userId, okrs) {
    try {
        const { error } = await supabase.from('okr_generations').update({
            okrs
        }).eq('user_id', userId).eq('is_draft', true);
        if (error) {
            console.error('Error updating OKRs:', error);
            return {
                success: false,
                message: 'Failed to update OKRs'
            };
        }
        return {
            success: true,
            message: 'OKRs updated successfully'
        };
    } catch (error) {
        console.error('Error in updateDraftOKRs:', error);
        return {
            success: false,
            message: 'An error occurred while updating OKRs'
        };
    }
}
}),
"[project]/app/api/invite/accept/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * API Route: POST /api/invite/accept
 * Accepts invitation and finalizes OKRs
 */ __turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { token } = body;
        if (!token) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invitation token is required'
            }, {
                status: 400
            });
        }
        // Accept invitation
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["acceptInvitation"])(token);
        if (!result.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: result.message
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error in POST /api/invite/accept:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__235c686d._.js.map