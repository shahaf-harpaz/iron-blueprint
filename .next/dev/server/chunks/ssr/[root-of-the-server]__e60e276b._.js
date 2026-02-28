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
"[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WorkoutPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/lib/supabase.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
;
async function WorkoutPage({ params }) {
    // STEP 1: Await the params (This fixes the red error in your terminal)
    const { id } = await params;
    // STEP 2: Fetch the data using the awaited ID
    const { data: template } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"].from('workout_templates').select('*').eq('id', id).single();
    if (!template) (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const { data: exercises } = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"].from('template_exercises').select(`
      order_index,
      exercises ( id, name, target_muscle_group )
    `).eq('template_id', id).order('order_index');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            marginLeft: '280px',
            padding: '50px',
            backgroundColor: 'black',
            minHeight: '100vh',
            color: 'white'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                style: {
                    marginBottom: '50px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: '#3b82f6',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em'
                        },
                        children: "Session View"
                    }, void 0, false, {
                        fileName: "[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            fontSize: '56px',
                            fontWeight: '900',
                            letterSpacing: '-0.05em',
                            color: 'white'
                        },
                        children: template.name
                    }, void 0, false, {
                        fileName: "[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gap: '30px'
                },
                children: exercises?.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            backgroundColor: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '40px',
                            padding: '40px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    marginBottom: '4px',
                                    color: 'white'
                                },
                                children: item.exercises.name
                            }, void 0, false, {
                                fileName: "[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx",
                                lineNumber: 38,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Shahaf$2f$iron$2d$blueprint$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: '#71717a',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                },
                                children: item.exercises.target_muscle_group
                            }, void 0, false, {
                                fileName: "[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx",
                                lineNumber: 39,
                                columnNumber: 13
                            }, this)
                        ]
                    }, index, true, {
                        fileName: "[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx",
                        lineNumber: 37,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
}),
"[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/Shahaf/iron-blueprint/app/workout/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e60e276b._.js.map