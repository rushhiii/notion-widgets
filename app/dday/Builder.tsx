"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Copy, RefreshCw, Info } from "lucide-react";
import { DdayWidget } from "@/components/widgets/DdayWidget";

type FancyOption = { value: string; label: string };

function FancySelect({
    value,
    onChange,
    options,
    placeholder = "Select",
    dropdownClassName = "",
    buttonClassName = "flex w-full items-center justify-between rounded-lg border border-white/12 bg-white/10 px-3 py-2 text-sm text-white/90 shadow-[0_1px_0_rgba(255,255,255,0.08)] transition focus:border-white/40 focus:ring-2 focus:ring-white/15 focus:outline-none",
}: {
    value: string;
    onChange: (value: string) => void;
    options: FancyOption[];
    placeholder?: string;
    dropdownClassName?: string;
    buttonClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, []);

    const current = options.find((o) => o.value === value);

    return (
        <div ref={wrapperRef} className="relative">
            <button type="button" className={buttonClassName} onClick={() => setOpen((v) => !v)}>
                <span className="truncate">{current?.label ?? placeholder}</span>
                <span className="ml-2 text-xs text-white/60">▾</span>
            </button>

            {open && (
                <div
                    className={`absolute left-0 z-20 mt-2 w-fit overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur ${dropdownClassName}`}
                >
                    <div className="max-h-56 min-w-[160px] overflow-y-auto scrollbar-hide">
                        {options.map((opt) => {
                            const active = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`flex w-full items-center justify-between px-3 py-2 text-sm text-white/90 transition hover:bg-white/10 ${active ? "bg-white/10" : ""
                                        }`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {active && <span className="pl-2 text-xs text-white/70">●</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

const paletteTextDefaults = {
    day: "#448361",
    week: "#6940A5",
    month: "#2383E2",
    year: "#D9730D",
    hours: "#2383E2",
    minutes: "#6940A5",
    seconds: "#C14C8A",
    total: "#D44C47",
    mega: "#D9730D",
    overview: "#0f172a",
};

const paletteColorDefaults = {
    title: "#DFAB01",
    overview: "#9B9A97",
    day: "#448361",
    week: "#6940A5",
    month: "#2383E2",
    year: "#D9730D",
    time: "#9B9A97",
    hours: "#2383E2",
    minutes: "#6940A5",
    seconds: "#C14C8A",
    total: "#D44C47",
    mega: "#D9730D",
};

const defaults = {
    date: "2025-11-11",
    mode: "elapsed" as const,
    align: "left" as const,
    note: "",
    showDate: true,
    showDays: true,
    showWeeks: true,
    showMonths: true,
    showYears: true,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    showTotalSeconds: true,
    showMegaSeconds: true,
    bg: "",
    color: "",
    titleColor: "",
    overviewColor: "",
    dayColor: "",
    weekColor: "",
    monthColor: "",
    yearColor: "",
    timeColor: "",
    hoursColor: "",
    minutesColor: "",
    secondsColor: "",
    totalColor: "",
    megaColor: "",
    dayText: "",
    weekText: "",
    monthText: "",
    yearText: "",
    hoursText: "",
    minutesText: "",
    secondsText: "",
    totalText: "",
    megaText: "",
    overviewText: "",
};

const ensureHex = (value: string, fallback: string) => {
    const v = value.trim();
    const hex = v.startsWith("#") ? v : v ? `#${v}` : "";
    if (!hex) return fallback;
    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(hex) ? hex : fallback;
};

export function DdayBuilder() {
    const [date, setDate] = useState(defaults.date);
    const [mode, setMode] = useState<"elapsed" | "countdown" | "overview">(defaults.mode);
    const [align, setAlign] = useState<"left" | "center" | "right">(defaults.align);
    const [note, setNote] = useState(defaults.note);
    const [showDate, setShowDate] = useState(defaults.showDate);
    const [bg, setBg] = useState(defaults.bg);
    const [color, setColor] = useState(defaults.color);
    const [showDays, setShowDays] = useState(defaults.showDays);
    const [showWeeks, setShowWeeks] = useState(defaults.showWeeks);
    const [showMonths, setShowMonths] = useState(defaults.showMonths);
    const [showYears, setShowYears] = useState(defaults.showYears);
    const [showHours, setShowHours] = useState(defaults.showHours);
    const [showMinutes, setShowMinutes] = useState(defaults.showMinutes);
    const [showSeconds, setShowSeconds] = useState(defaults.showSeconds);
    const [showTotalSeconds, setShowTotalSeconds] = useState(defaults.showTotalSeconds);
    const [showMegaSeconds, setShowMegaSeconds] = useState(defaults.showMegaSeconds);
    const [titleColor, setTitleColor] = useState(defaults.titleColor);
    const [overviewColor, setOverviewColor] = useState(defaults.overviewColor);
    const [dayColor, setDayColor] = useState(defaults.dayColor);
    const [weekColor, setWeekColor] = useState(defaults.weekColor);
    const [monthColor, setMonthColor] = useState(defaults.monthColor);
    const [yearColor, setYearColor] = useState(defaults.yearColor);
    const [timeColor, setTimeColor] = useState(defaults.timeColor);
    const [hoursColor, setHoursColor] = useState(defaults.hoursColor);
    const [minutesColor, setMinutesColor] = useState(defaults.minutesColor);
    const [secondsColor, setSecondsColor] = useState(defaults.secondsColor);
    const [totalColor, setTotalColor] = useState(defaults.totalColor);
    const [megaColor, setMegaColor] = useState(defaults.megaColor);
    const [dayText, setDayText] = useState(defaults.dayText);
    const [weekText, setWeekText] = useState(defaults.weekText);
    const [monthText, setMonthText] = useState(defaults.monthText);
    const [yearText, setYearText] = useState(defaults.yearText);
    const [hoursText, setHoursText] = useState(defaults.hoursText);
    const [minutesText, setMinutesText] = useState(defaults.minutesText);
    const [secondsText, setSecondsText] = useState(defaults.secondsText);
    const [totalText, setTotalText] = useState(defaults.totalText);
    const [megaText, setMegaText] = useState(defaults.megaText);
    const [overviewText, setOverviewText] = useState(defaults.overviewText);
    const [copied, setCopied] = useState(false);

    const params = useMemo(() => {
        const p = new URLSearchParams();
        p.set("embed", "1");
        p.set("date", date);
        if (mode !== "elapsed") p.set("mode", mode);
        if (!showDate) p.set("showdate", "0");
        if (note.trim()) p.set("note", note.trim());
        if (align !== "left") p.set("align", align);
        if (bg) p.set("bg", bg.replace("#", ""));
        if (color) p.set("color", color.replace("#", ""));
        const allOn =
            showDays &&
            showWeeks &&
            showMonths &&
            showYears &&
            showHours &&
            showMinutes &&
            showSeconds &&
            showTotalSeconds &&
            showMegaSeconds;
        if (allOn) {
            p.set("display", "all");
        } else {
            p.set("day", showDays ? "1" : "0");
            p.set("week", showWeeks ? "1" : "0");
            p.set("month", showMonths ? "1" : "0");
            p.set("year", showYears ? "1" : "0");
            p.set("hours", showHours ? "1" : "0");
            p.set("minutes", showMinutes ? "1" : "0");
            p.set("seconds", showSeconds ? "1" : "0");
            p.set("totalseconds", showTotalSeconds ? "1" : "0");
            p.set("megaseconds", showMegaSeconds ? "1" : "0");
        }
        if (titleColor.trim()) p.set("titleColor", titleColor.trim());
        if (overviewColor.trim()) p.set("overviewColor", overviewColor.trim());
        if (dayColor.trim()) p.set("dayColor", dayColor.trim());
        if (weekColor.trim()) p.set("weekColor", weekColor.trim());
        if (monthColor.trim()) p.set("monthColor", monthColor.trim());
        if (yearColor.trim()) p.set("yearColor", yearColor.trim());
        if (timeColor.trim()) p.set("timeColor", timeColor.trim());
        if (hoursColor.trim()) p.set("hoursColor", hoursColor.trim());
        if (minutesColor.trim()) p.set("minutesColor", minutesColor.trim());
        if (secondsColor.trim()) p.set("secondsColor", secondsColor.trim());
        if (totalColor.trim()) p.set("totalColor", totalColor.trim());
        if (megaColor.trim()) p.set("megaColor", megaColor.trim());
        if (dayText.trim()) p.set("dayText", dayText.trim());
        if (weekText.trim()) p.set("weekText", weekText.trim());
        if (monthText.trim()) p.set("monthText", monthText.trim());
        if (yearText.trim()) p.set("yearText", yearText.trim());
        if (hoursText.trim()) p.set("hoursText", hoursText.trim());
        if (minutesText.trim()) p.set("minutesText", minutesText.trim());
        if (secondsText.trim()) p.set("secondsText", secondsText.trim());
        if (totalText.trim()) p.set("totalText", totalText.trim());
        if (megaText.trim()) p.set("megaText", megaText.trim());
        if (overviewText.trim()) p.set("overviewText", overviewText.trim());
        return p;
    }, [date, mode, showDate, note, align, bg, color, showDays, showWeeks, showMonths, showYears, showHours, showMinutes, showSeconds, showTotalSeconds, showMegaSeconds, titleColor, overviewColor, dayColor, weekColor, monthColor, yearColor, timeColor, hoursColor, minutesColor, secondsColor, totalColor, megaColor, dayText, weekText, monthText, yearText, hoursText, minutesText, secondsText, totalText, megaText, overviewText]);

    const livePreviewParams = useMemo(
        () => ({
            date,
            mode,
            align,
            note,
            showdate: showDate ? 1 : 0,
            ...(bg ? { bg } : {}),
            ...(color ? { color } : {}),
            ...(showDays &&
                showWeeks &&
                showMonths &&
                showYears &&
                showHours &&
                showMinutes &&
                showSeconds &&
                showTotalSeconds &&
                showMegaSeconds
                ? { display: "all" as const }
                : {
                    day: showDays ? 1 : 0,
                    week: showWeeks ? 1 : 0,
                    month: showMonths ? 1 : 0,
                    year: showYears ? 1 : 0,
                    hours: showHours ? 1 : 0,
                    minutes: showMinutes ? 1 : 0,
                    seconds: showSeconds ? 1 : 0,
                    totalseconds: showTotalSeconds ? 1 : 0,
                    megaseconds: showMegaSeconds ? 1 : 0,
                }),
            ...(titleColor.trim() ? { titleColor: titleColor.trim() } : {}),
            ...(overviewColor.trim() ? { overviewColor: overviewColor.trim() } : {}),
            ...(dayColor.trim() ? { dayColor: dayColor.trim() } : {}),
            ...(weekColor.trim() ? { weekColor: weekColor.trim() } : {}),
            ...(monthColor.trim() ? { monthColor: monthColor.trim() } : {}),
            ...(yearColor.trim() ? { yearColor: yearColor.trim() } : {}),
            ...(timeColor.trim() ? { timeColor: timeColor.trim() } : {}),
            ...(hoursColor.trim() ? { hoursColor: hoursColor.trim() } : {}),
            ...(minutesColor.trim() ? { minutesColor: minutesColor.trim() } : {}),
            ...(secondsColor.trim() ? { secondsColor: secondsColor.trim() } : {}),
            ...(totalColor.trim() ? { totalColor: totalColor.trim() } : {}),
            ...(megaColor.trim() ? { megaColor: megaColor.trim() } : {}),
            ...(dayText.trim() ? { dayText: dayText.trim() } : {}),
            ...(weekText.trim() ? { weekText: weekText.trim() } : {}),
            ...(monthText.trim() ? { monthText: monthText.trim() } : {}),
            ...(yearText.trim() ? { yearText: yearText.trim() } : {}),
            ...(hoursText.trim() ? { hoursText: hoursText.trim() } : {}),
            ...(minutesText.trim() ? { minutesText: minutesText.trim() } : {}),
            ...(secondsText.trim() ? { secondsText: secondsText.trim() } : {}),
            ...(totalText.trim() ? { totalText: totalText.trim() } : {}),
            ...(megaText.trim() ? { megaText: megaText.trim() } : {}),
            ...(overviewText.trim() ? { overviewText: overviewText.trim() } : {}),
        }),
        [date, mode, align, note, showDate, bg, color, showDays, showWeeks, showMonths, showYears, showHours, showMinutes, showSeconds, showTotalSeconds, showMegaSeconds, titleColor, overviewColor, dayColor, weekColor, monthColor, yearColor, timeColor, hoursColor, minutesColor, secondsColor, totalColor, megaColor, dayText, weekText, monthText, yearText, hoursText, minutesText, secondsText, totalText, megaText, overviewText],
    );

    const reset = () => {
        setDate(defaults.date);
        setMode(defaults.mode);
        setAlign(defaults.align);
        setNote(defaults.note);
        setShowDate(defaults.showDate);
        setBg(defaults.bg);
        setColor(defaults.color);
        setShowDays(defaults.showDays);
        setShowWeeks(defaults.showWeeks);
        setShowMonths(defaults.showMonths);
        setShowYears(defaults.showYears);
        setShowHours(defaults.showHours);
        setShowMinutes(defaults.showMinutes);
        setShowSeconds(defaults.showSeconds);
        setShowTotalSeconds(defaults.showTotalSeconds);
        setShowMegaSeconds(defaults.showMegaSeconds);
        setTitleColor(defaults.titleColor);
        setOverviewColor(defaults.overviewColor);
        setDayColor(defaults.dayColor);
        setWeekColor(defaults.weekColor);
        setMonthColor(defaults.monthColor);
        setYearColor(defaults.yearColor);
        setTimeColor(defaults.timeColor);
        setHoursColor(defaults.hoursColor);
        setMinutesColor(defaults.minutesColor);
        setSecondsColor(defaults.secondsColor);
        setTotalColor(defaults.totalColor);
        setMegaColor(defaults.megaColor);
        setDayText(defaults.dayText);
        setWeekText(defaults.weekText);
        setMonthText(defaults.monthText);
        setYearText(defaults.yearText);
        setHoursText(defaults.hoursText);
        setMinutesText(defaults.minutesText);
        setSecondsText(defaults.secondsText);
        setTotalText(defaults.totalText);
        setMegaText(defaults.megaText);
        setOverviewText(defaults.overviewText);
    };

    const copyLink = () => {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.origin + "/dday");
        params.forEach((v, k) => url.searchParams.set(k, v));
        navigator.clipboard
            .writeText(url.toString())
            .then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
            })
            .catch(() => undefined);
    };

    return (
        <main className="flex min-h-screen w-full items-start justify-center bg-zinc-950 px-4 py-10 text-zinc-100">
            <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-[340px,1fr]">
                <section className="flex max-h-[88vh] flex-col gap-4 overflow-y-auto scrollbar-hide rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">D-Day Widget Builder</h2>
                            <p className="text-sm text-zinc-400">Configure your countdown/elapsed badge.</p>
                        </div>
                        <button
                            className="rounded-full border border-white/10 p-2 text-zinc-200 transition hover:bg-white/10"
                            onClick={reset}
                            aria-label="Reset"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <label className="space-y-1 text-sm">
                            <span className="text-zinc-300">Target date</span>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="space-y-1 text-sm">
                                <span className="text-zinc-300">Mode</span>
                                <FancySelect
                                    value={mode}
                                    onChange={(val) => setMode(val as typeof mode)}
                                    options={[
                                        { value: "elapsed", label: "Elapsed" },
                                        { value: "countdown", label: "Countdown" },
                                        { value: "overview", label: "Overview" },
                                    ]}
                                />
                            </label>
                            <label className="space-y-1 text-sm">
                                <span className="text-zinc-300">Align</span>
                                <FancySelect
                                    value={align}
                                    onChange={(val) => setAlign(val as typeof align)}
                                    options={[
                                        { value: "left", label: "Left" },
                                        { value: "center", label: "Center" },
                                        { value: "right", label: "Right" },
                                    ]}
                                />
                            </label>
                        </div>

                        <label className="space-y-1 text-sm">
                            <span className="text-zinc-300">Note (optional)</span>
                            <input
                                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ex: Anniversary"
                            />
                        </label>

                        <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-300">Show/hide badges</span>
                                <span className="text-[11px] text-zinc-500">Matches widget options</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-zinc-200">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showDays}
                                        onChange={(e) => setShowDays(e.target.checked)}
                                    />
                                    Days
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showWeeks}
                                        onChange={(e) => setShowWeeks(e.target.checked)}
                                    />
                                    Weeks
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showMonths}
                                        onChange={(e) => setShowMonths(e.target.checked)}
                                    />
                                    Months
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showYears}
                                        onChange={(e) => setShowYears(e.target.checked)}
                                    />
                                    Years
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showHours}
                                        onChange={(e) => setShowHours(e.target.checked)}
                                    />
                                    Hours
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showMinutes}
                                        onChange={(e) => setShowMinutes(e.target.checked)}
                                    />
                                    Minutes
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showSeconds}
                                        onChange={(e) => setShowSeconds(e.target.checked)}
                                    />
                                    Seconds
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showTotalSeconds}
                                        onChange={(e) => setShowTotalSeconds(e.target.checked)}
                                    />
                                    Total seconds
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showMegaSeconds}
                                        onChange={(e) => setShowMegaSeconds(e.target.checked)}
                                    />
                                    Mega-seconds
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                                        checked={showDate}
                                        onChange={(e) => setShowDate(e.target.checked)}
                                    />
                                    Show formatted date
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="space-y-1 text-sm">
                                <span className="text-zinc-300">Background</span>
                                <input
                                    type="color"
                                    className="color-swatch"
                                    value={bg}
                                    onChange={(e) => setBg(e.target.value)}
                                />
                            </label>
                            <label className="space-y-1 text-sm">
                                <span className="text-zinc-300">Accent / badge color</span>
                                <div className="flex items-center gap-2">
                                    {/* <input
                    className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="(optional) leave blank for defaults"
                  /> */}
                                    <input
                                        type="color"
                                        className="color-swatch "
                                        value={ensureHex(color, "#EBECED")}
                                        onChange={(e) => setColor(e.target.value)}
                                        aria-label="Pick accent color"
                                    />
                                </div>
                            </label>
                        </div>

                        <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                            {/* <div className="flex items-center justify-between"> */}
                            <div className="">
                                <span className="text-sm text-zinc-300">Background & text colors</span> <br />
                                <span className="text-[11px] text-zinc-500">Leave text blank to auto-pick</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm w-full text-center text-zinc-300">Pick bg colors</span>|
                                <span className="text-sm  w-full text-center text-zinc-300">Pick txt colors</span>

                            </div>
                            <div className="space-y-3 text-sm">
                                {[{
                                    label: "Title",
                                    bg: { value: titleColor, onChange: setTitleColor, placeholder: paletteColorDefaults.title, fallback: paletteColorDefaults.title },
                                    text: null,
                                }, {
                                    label: "Overview",
                                    bg: { value: overviewColor, onChange: setOverviewColor, placeholder: paletteColorDefaults.overview, fallback: paletteColorDefaults.overview },
                                    text: { value: overviewText, onChange: setOverviewText, placeholder: paletteTextDefaults.overview, fallback: paletteTextDefaults.overview },
                                }, {
                                    label: "Days",
                                    bg: { value: dayColor, onChange: setDayColor, placeholder: paletteColorDefaults.day, fallback: paletteColorDefaults.day },
                                    text: { value: dayText, onChange: setDayText, placeholder: paletteTextDefaults.day, fallback: paletteTextDefaults.day },
                                }, {
                                    label: "Weeks",
                                    bg: { value: weekColor, onChange: setWeekColor, placeholder: paletteColorDefaults.week, fallback: paletteColorDefaults.week },
                                    text: { value: weekText, onChange: setWeekText, placeholder: paletteTextDefaults.week, fallback: paletteTextDefaults.week },
                                }, {
                                    label: "Months",
                                    bg: { value: monthColor, onChange: setMonthColor, placeholder: paletteColorDefaults.month, fallback: paletteColorDefaults.month },
                                    text: { value: monthText, onChange: setMonthText, placeholder: paletteTextDefaults.month, fallback: paletteTextDefaults.month },
                                }, {
                                    label: "Years",
                                    bg: { value: yearColor, onChange: setYearColor, placeholder: paletteColorDefaults.year, fallback: paletteColorDefaults.year },
                                    text: { value: yearText, onChange: setYearText, placeholder: paletteTextDefaults.year, fallback: paletteTextDefaults.year },
                                }, {
                                    label: "Time group",
                                    bg: { value: timeColor, onChange: setTimeColor, placeholder: paletteColorDefaults.time, fallback: paletteColorDefaults.time },
                                    text: null,
                                }, {
                                    label: "Hours",
                                    bg: { value: hoursColor, onChange: setHoursColor, placeholder: paletteColorDefaults.hours, fallback: paletteColorDefaults.hours },
                                    text: { value: hoursText, onChange: setHoursText, placeholder: paletteTextDefaults.hours, fallback: paletteTextDefaults.hours },
                                }, {
                                    label: "Minutes",
                                    bg: { value: minutesColor, onChange: setMinutesColor, placeholder: paletteColorDefaults.minutes, fallback: paletteColorDefaults.minutes },
                                    text: { value: minutesText, onChange: setMinutesText, placeholder: paletteTextDefaults.minutes, fallback: paletteTextDefaults.minutes },
                                }, {
                                    label: "Seconds",
                                    bg: { value: secondsColor, onChange: setSecondsColor, placeholder: paletteColorDefaults.seconds, fallback: paletteColorDefaults.seconds },
                                    text: { value: secondsText, onChange: setSecondsText, placeholder: paletteTextDefaults.seconds, fallback: paletteTextDefaults.seconds },
                                }, {
                                    label: "Total seconds",
                                    bg: { value: totalColor, onChange: setTotalColor, placeholder: paletteColorDefaults.total, fallback: paletteColorDefaults.total },
                                    text: { value: totalText, onChange: setTotalText, placeholder: paletteTextDefaults.total, fallback: paletteTextDefaults.total },
                                }, {
                                    label: "Mega-seconds",
                                    bg: { value: megaColor, onChange: setMegaColor, placeholder: paletteColorDefaults.mega, fallback: paletteColorDefaults.mega },
                                    text: { value: megaText, onChange: setMegaText, placeholder: paletteTextDefaults.mega, fallback: paletteTextDefaults.mega },
                                }].map((item) => (
                                    //   <div key={item.label} className="grid grid-cols-[120px,1fr,1fr] items-center gap-3">
                                    <div key={item.label} className="">

                                        <span className="text-zinc-300">{item.label}</span>

                                        <div className="grid grid-cols-[1fr,1fr] items-center gap-2">

                                            {/* <div className="flex items-center gap-2"> */}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                                                    placeholder={item.bg.placeholder}
                                                    value={item.bg.value}
                                                    onChange={(e) => item.bg.onChange(e.target.value)}
                                                />
                                                <input
                                                    type="color"
                                                    className="color-swatch max-w-[16px] h-10"
                                                    value={ensureHex(item.bg.value, item.bg.fallback)}
                                                    onChange={(e) => item.bg.onChange(e.target.value)}
                                                    aria-label={`${item.label} background color picker`}
                                                />
                                            </div>
                                            {item.text ? (
                                                //   <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                                                        placeholder={item.text.placeholder}
                                                        value={item.text.value}
                                                        onChange={(e) => item.text?.onChange(e.target.value)}
                                                    />
                                                    <input
                                                        type="color"
                                                        className="color-swatch max-w-[16px] h-10"
                                                        value={ensureHex(item.text.value || item.text.fallback, item.text.fallback)}
                                                        onChange={(e) => item.text?.onChange(e.target.value)}
                                                        aria-label={`${item.label} text color picker`}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-xs w-full text-center text-zinc-500">~ Text auto ~</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white"
                        onClick={copyLink}
                    >
                        <Copy size={16} />
                        {copied ? "Copied" : "Copy embed URL"}
                    </button>
                    <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                        <Info size={14} />
                        <span>Tip: add embed=1 to hide the builder when pasting into Notion.</span>
                    </p>
                </section>

                <section className="flex max-h-[88vh] flex-col items-stretch justify-center rounded-2xl border border-white/10 bg-white/5 p-0 shadow-xl overflow-hidden">
                    <div
                        className="flex h-full w-full items-center justify-center "
                        style={{ background: bg || "#0f172a" }}
                    >
                        <div className="m-auto">
                            <DdayWidget embedParams={livePreviewParams} />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default DdayBuilder;
