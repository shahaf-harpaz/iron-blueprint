module.exports = [
"[project]/Documents/Shahaf/iron-blueprint/app/favicon.ico.mjs { IMAGE => \"[project]/Documents/Shahaf/iron-blueprint/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/app/favicon.ico.mjs { IMAGE => \"[project]/Documents/Shahaf/iron-blueprint/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Documents/Shahaf/iron-blueprint/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Documents/Shahaf/iron-blueprint/lib/supabase.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://dxuluecakexrwskqlwjz.supabase.co") || '';
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_xEXSx6f9HsxQ35MqYwrmAw_1V0XJ8lK") || '';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
}),
"[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BackendTest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/lib/supabase.ts [app-rsc] (ecmascript)");
;
;
async function BackendTest() {
    const results = [];
    // TEST 1: Read Table Structure
    const { data: readData, error: readError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"].from('workout_templates').select('*').limit(1);
    results.push({
        name: 'Database Read',
        status: readError ? 'FAIL' : 'PASS',
        details: readError?.message || `Successfully fetched ${readData?.length} rows.`
    });
    // TEST 2: Write/Insert (Verification of API Write Permissions)
    const tempName = `Test-${Math.floor(Math.random() * 1000)}`;
    const { data: insertData, error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"].from('workout_templates').insert([
        {
            name: tempName,
            day_number: 99,
            description: 'Diagnostic cleanup required'
        }
    ]).select();
    results.push({
        name: 'Database Write',
        status: insertError ? 'FAIL' : 'PASS',
        details: insertError?.message || `Inserted row with ID: ${insertData?.[0]?.id}`
    });
    // TEST 3: Cleanup (Delete the test row)
    if (insertData?.[0]?.id) {
        const { error: deleteError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"].from('workout_templates').delete().eq('id', insertData[0].id);
        results.push({
            name: 'Database Delete',
            status: deleteError ? 'FAIL' : 'PASS',
            details: deleteError?.message || 'Test row purged successfully.'
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-2xl mx-auto py-20 px-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-4xl font-black tracking-tighter mb-10",
                children: "BACKEND DIAGNOSTIC"
            }, void 0, false, {
                fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4",
                children: results.map((res, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `p-6 rounded-2xl border ${res.status === 'PASS' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center mb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-bold uppercase tracking-widest text-zinc-400",
                                        children: res.name
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
                                        lineNumber: 49,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-xs font-black px-2 py-1 rounded ${res.status === 'PASS' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`,
                                        children: res.status
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
                                        lineNumber: 50,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
                                lineNumber: 48,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-mono text-sm",
                                children: res.details
                            }, void 0, false, {
                                fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-10 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-zinc-500 font-medium italic",
                    children: "Note: RLS is currently DISABLED for all tables in your project Project."
                }, void 0, false, {
                    fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
}),
"[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/app/test-backend/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3dd36937._.js.map