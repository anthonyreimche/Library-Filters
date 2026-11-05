//#region src/filter.ts
function e(e) {
	return e.rating > 0 || e.ratingOp !== "gte";
}
function t(t) {
	return e(t) || t.flag !== "any" || t.label !== "any" || t.keywords.length > 0;
}
//#endregion
//#region src/rt.ts
var n, r;
function i(e) {
	r = e, n = e.react;
}
//#endregion
//#region src/LibraryFiltersPanel.tsx
var a = "safelight-filters", o = {
	root: a,
	scopes: `${a}-scopes`,
	item: `${a}-item`,
	itemActive: `${a}-item-active`,
	count: `${a}-count`,
	fields: `${a}-fields`,
	row: `${a}-row`,
	ratingLabel: `${a}-rating-label`,
	op: `${a}-op`,
	fieldLabel: `${a}-field-label`,
	swatches: `${a}-swatches`,
	swatch: `${a}-swatch`,
	swatchActive: `${a}-swatch-active`,
	keyword: `${a}-keyword`,
	chips: `${a}-chips`,
	chip: `${a}-chip`,
	chipRemove: `${a}-chip-remove`,
	inputWrap: `${a}-input-wrap`,
	input: `${a}-input`,
	suggestions: `${a}-suggestions`,
	suggestion: `${a}-suggestion`,
	suggestionActive: `${a}-suggestion-active`,
	clear: `${a}-clear`
}, s = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
], c = (e) => `${o.swatch}-${e}`, l = [
	"lt",
	"gt",
	"lte",
	"gte",
	"eq",
	"neq"
], u = {
	lt: "<",
	lte: "≤",
	gt: ">",
	gte: "≥",
	eq: "=",
	neq: "≠"
}, d = 6;
function f(e) {
	let t = o, n = `color-mix(in oklab, ${e.accent} 20%, transparent)`, r = {
		red: e.labelRed,
		yellow: e.labelYellow,
		green: e.labelGreen,
		blue: e.labelBlue,
		purple: e.labelPurple
	}, i = s.map((e) => `:where(.${c(e)}) { background-color: ${r[e]}; }`).join("\n"), a = [
		t.item,
		t.ratingLabel,
		t.fieldLabel,
		t.input,
		t.suggestion,
		t.clear
	];
	return `
:where(.${t.root}) { display: flex; flex-direction: column; }
:where(.${t.scopes} > :not(:last-child)) { margin-block-start: 0; margin-block-end: 0.25rem; }
:where(.${t.item}) { display: flex; align-items: center; justify-content: space-between; border-radius: 0.25rem; padding: 0.25rem 0.5rem; font-size: 11px; color: ${e.textSecondary}; cursor: pointer; }
:where(.${t.itemActive}) { background-color: ${e.surface3}; color: ${e.textPrimary}; }
@media (hover: hover) { :where(.${t.item}:not(.${t.itemActive}):hover) { background-color: ${e.surface2}; color: ${e.textPrimary}; } }
:where(.${t.count}) { color: ${e.textMuted}; }
:where(.${t.fields} > :not(:last-child)) { margin-block-start: 0; margin-block-end: 0.75rem; }
:where(.${t.row}) { display: flex; align-items: center; justify-content: space-between; }
:where(.${t.ratingLabel}) { display: flex; align-items: center; gap: 0.375rem; font-size: 11px; color: ${e.textSecondary}; }
:where(.${t.op}) { width: 1.25rem; border-radius: 0.25rem; background-color: ${e.surface2}; padding-block: 0.125rem; text-align: center; color: ${e.textPrimary}; }
@media (hover: hover) { :where(.${t.op}:hover) { background-color: ${e.surface3}; } }
:where(.${t.fieldLabel}) { font-size: 11px; color: ${e.textSecondary}; }
:where(.${t.swatches}) { display: flex; gap: 0.375rem; }
:where(.${t.swatch}) { height: 0.875rem; width: 0.875rem; border-radius: 9999px; opacity: 0.6; }
${i}
:where(.${t.swatchActive}) { opacity: 1; box-shadow: 0 0 0 2px ${e.textPrimary}; }
@media (hover: hover) { :where(.${t.swatch}:hover) { opacity: 1; } }
:where(.${t.keyword} > :not(:last-child)) { margin-block-start: 0; margin-block-end: 0.375rem; }
:where(.${t.chips}) { display: flex; flex-wrap: wrap; gap: 0.25rem; }
:where(.${t.chip}) { display: inline-flex; align-items: center; gap: 0.125rem; border-radius: 0.25rem; background-color: ${n}; padding: 0.125rem 0.375rem; font-size: 10px; color: ${e.textPrimary}; }
:where(.${t.chipRemove}) { margin-left: 0.125rem; color: ${e.textMuted}; }
@media (hover: hover) { :where(.${t.chipRemove}:hover) { color: ${e.textPrimary}; } }
:where(.${t.inputWrap}) { position: relative; }
:where(.${t.input}) { width: 100%; border-radius: 0.25rem; background-color: ${e.surface2}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${e.textPrimary}; outline-style: none; }
:where(.${t.input})::placeholder { color: ${e.textMuted}; }
:where(.${t.input}:focus) { box-shadow: 0 0 0 1px ${e.accent}; }
:where(.${t.suggestions}) { position: absolute; left: 0; right: 0; top: 100%; z-index: 50; margin-top: 0.125rem; border: 1px solid ${e.border}; border-radius: 0.25rem; background-color: ${e.surface1}; padding-block: 0.125rem; box-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a; }
:where(.${t.suggestion}) { display: flex; width: 100%; align-items: center; justify-content: space-between; padding: 0.25rem 0.5rem; font-size: 11px; color: ${e.textSecondary}; }
:where(.${t.suggestionActive}) { background-color: ${n}; color: ${e.textPrimary}; }
@media (hover: hover) { :where(.${t.suggestion}:not(.${t.suggestionActive}):hover) { background-color: ${e.surface2}; } }
:where(.${t.clear}) { width: 100%; border-radius: 0.25rem; background-color: ${e.surface2}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${e.textSecondary}; }
@media (hover: hover) { :where(.${t.clear}:hover) { background-color: ${e.surface3}; color: ${e.textPrimary}; } }
:where(.${t.clear}:disabled) { cursor: not-allowed; opacity: 0.4; }
${a.map((e) => `html.sl-larger-text .${e}`).join(", ")} { font-size: 13px !important; line-height: 1.45 !important; }
html.sl-larger-text .${t.chip} { font-size: 12px !important; }
`;
}
function p() {
	let { Panel: e, Rating: i } = r.components, { useCatalogStore: a, useUIStore: d } = r.stores, f = a((e) => e.photos), p = d((e) => e.filter), g = d((e) => e.setFilter), _ = d((e) => e.clearFilters), v = d((e) => e.activeFolder), y = d((e) => e.setActiveFolder), b = f.filter((e) => e.flag === "pick").length, x = f.filter((e) => e.flag === "reject").length, S = f.filter((e) => e.rating > 0).length, C = t(p);
	return /* @__PURE__ */ n.createElement("div", { className: o.root }, /* @__PURE__ */ n.createElement(e, { title: "Catalogue" }, /* @__PURE__ */ n.createElement("div", { className: o.scopes }, /* @__PURE__ */ n.createElement(h, {
		label: "All Photos",
		count: f.length,
		active: !C && v === null,
		onClick: () => {
			_(), y(null);
		}
	}), /* @__PURE__ */ n.createElement(h, {
		label: "Picks",
		count: b,
		active: p.flag === "pick",
		onClick: () => g({ flag: p.flag === "pick" ? "any" : "pick" })
	}), /* @__PURE__ */ n.createElement(h, {
		label: "Rejects",
		count: x,
		active: p.flag === "reject",
		onClick: () => g({ flag: p.flag === "reject" ? "any" : "reject" })
	}), /* @__PURE__ */ n.createElement(h, {
		label: "Rated",
		count: S,
		active: p.ratingOp === "gte" && p.rating > 0,
		onClick: () => g({
			rating: p.rating > 0 ? 0 : 1,
			ratingOp: "gte"
		})
	}))), /* @__PURE__ */ n.createElement(e, { title: "Filters" }, /* @__PURE__ */ n.createElement("div", { className: o.fields }, /* @__PURE__ */ n.createElement("div", { className: o.row }, /* @__PURE__ */ n.createElement("div", { className: o.ratingLabel }, /* @__PURE__ */ n.createElement("span", null, "Rating"), /* @__PURE__ */ n.createElement("button", {
		onClick: () => {
			let e = l.indexOf(p.ratingOp);
			g({ ratingOp: l[(e + 1) % l.length] });
		},
		title: "Change comparison (<, >, ≤, ≥, =, ≠)",
		className: o.op
	}, u[p.ratingOp])), /* @__PURE__ */ n.createElement(i, {
		value: p.rating,
		onChange: (e) => g({ rating: e }),
		size: "md"
	})), /* @__PURE__ */ n.createElement("div", { className: o.row }, /* @__PURE__ */ n.createElement("span", { className: o.fieldLabel }, "Label"), /* @__PURE__ */ n.createElement("div", { className: o.swatches }, s.map((e) => /* @__PURE__ */ n.createElement("button", {
		key: e,
		onClick: () => g({ label: p.label === e ? "any" : e }),
		className: `${o.swatch} ${c(e)}${p.label === e ? ` ${o.swatchActive}` : ""}`,
		"aria-label": e
	})))), /* @__PURE__ */ n.createElement(m, null), /* @__PURE__ */ n.createElement("button", {
		onClick: _,
		disabled: !C,
		className: o.clear
	}, "Clear filters"))));
}
function m() {
	let { useCatalogStore: e, useUIStore: t } = r.stores, i = e((e) => e.photos), a = t((e) => e.filter), s = t((e) => e.setFilter), [c, l] = n.useState(""), [u, f] = n.useState(!1), [p, m] = n.useState(0), h = n.useRef(null), g = n.useMemo(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of i) for (let n of t.keywords) e.set(n, (e.get(n) ?? 0) + 1);
		return e;
	}, [i]), _ = n.useMemo(() => {
		let e = c.trim().toLowerCase();
		if (!e) return [];
		let t = new Set(a.keywords.map((e) => e.toLowerCase()));
		return [...g.entries()].filter(([n]) => n.toLowerCase().includes(e) && !t.has(n.toLowerCase())).sort((e, t) => t[1] - e[1]).slice(0, d);
	}, [
		c,
		g,
		a.keywords
	]);
	n.useEffect(() => m(0), [_.length]), n.useEffect(() => {
		let e = (e) => {
			let t = h.current;
			t && !(e.target instanceof Node && t.contains(e.target)) && f(!1);
		};
		return document.addEventListener("mousedown", e), () => document.removeEventListener("mousedown", e);
	}, []);
	let v = (e) => {
		let t = e.trim();
		t && !a.keywords.includes(t) && (s({ keywords: [...a.keywords, t] }), l(""), f(!1));
	}, y = (e) => {
		s({ keywords: a.keywords.filter((t) => t !== e) });
	};
	return g.size === 0 ? null : /* @__PURE__ */ n.createElement("div", {
		ref: h,
		className: o.keyword
	}, /* @__PURE__ */ n.createElement("span", { className: o.fieldLabel }, "Keyword"), a.keywords.length > 0 && /* @__PURE__ */ n.createElement("div", { className: o.chips }, a.keywords.map((e) => /* @__PURE__ */ n.createElement("span", {
		key: e,
		className: o.chip
	}, e, /* @__PURE__ */ n.createElement("button", {
		onClick: () => y(e),
		className: o.chipRemove,
		"aria-label": `Remove ${e} from keyword filter`
	}, /* @__PURE__ */ n.createElement("span", { "aria-hidden": "true" }, "×"))))), /* @__PURE__ */ n.createElement("div", { className: o.inputWrap }, /* @__PURE__ */ n.createElement("input", {
		value: c,
		onChange: (e) => {
			l(e.target.value), f(!0);
		},
		onFocus: () => f(!0),
		onKeyDown: (e) => {
			e.key === "Enter" || e.key === "," ? (e.preventDefault(), u && _.length > 0 ? v(_[p][0]) : v(c)) : e.key === "Escape" ? f(!1) : e.key === "ArrowDown" && u ? (e.preventDefault(), m((e) => Math.min(e + 1, _.length - 1))) : e.key === "ArrowUp" && u ? (e.preventDefault(), m((e) => Math.max(e - 1, 0))) : e.key === "Backspace" && c === "" && a.keywords.length > 0 && y(a.keywords[a.keywords.length - 1]);
		},
		placeholder: "Filter by keyword…",
		"aria-label": "Filter by keyword",
		className: o.input
	}), u && _.length > 0 && /* @__PURE__ */ n.createElement("div", { className: o.suggestions }, _.map(([e, t], r) => /* @__PURE__ */ n.createElement("button", {
		key: e,
		onMouseDown: (t) => {
			t.preventDefault(), v(e);
		},
		onMouseEnter: () => m(r),
		className: `${o.suggestion}${r === p ? ` ${o.suggestionActive}` : ""}`
	}, /* @__PURE__ */ n.createElement("span", null, e), /* @__PURE__ */ n.createElement("span", { className: o.count }, t))))));
}
function h({ label: e, count: t, active: r, onClick: i }) {
	return /* @__PURE__ */ n.createElement("div", {
		onClick: i,
		className: `${o.item}${r ? ` ${o.itemActive}` : ""}`
	}, /* @__PURE__ */ n.createElement("span", null, e), /* @__PURE__ */ n.createElement("span", { className: o.count }, t));
}
//#endregion
//#region src/index.tsx
var g = "core.filters", _ = "safelight.filters.styles";
function v(e) {
	i(e), e.registerStylesheet({
		id: _,
		css: f(e.ui.tokens)
	}), e.registerPanel({
		id: g,
		title: "Filters",
		component: p,
		defaultDock: {
			module: "library",
			direction: "left",
			order: 1,
			width: 240
		}
	});
}
//#endregion
export { g as PANEL_ID, _ as STYLESHEET_ID, v as activate };

//# sourceMappingURL=index.js.map