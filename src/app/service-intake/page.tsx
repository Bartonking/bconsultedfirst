"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  IconArrowRight,
  IconBolt,
  IconCalendar,
  IconCatalog,
  IconChart,
  IconChat,
  IconCheck,
  IconClipboard,
  IconEye,
  IconGlobe,
  IconIntegration,
  IconMap,
  IconShield,
  IconShoppingBag,
  IconStorefront,
  IconTrendingUp,
  IconUser,
  IconUsers,
  IconWorkflow,
  IconWrench,
  IconX,
} from "@/components/icons";
import type {
  ServiceIntakeConfig,
  ServiceIntakeQuestionConfig,
  ServiceIntakeStepId,
} from "@/lib/types";

interface ServiceIntakeContext {
  engagementId: string;
  status: string;
  email: string;
  storeName: string | null;
  siteUrl: string;
  meetingAt: string | null;
  meetingUrl: string | null;
  prioritySummary: string | null;
  intakeResponses: {
    teamSize?: string;
    fulfillmentSetup?: string;
    systems?: string;
    topProblems?: string[];
    goals?: string;
  } | null;
  config: ServiceIntakeConfig;
}

interface WizardState {
  teamSizeOptionId: string | null;
  teamSizeDetail: string;
  fulfillmentOptionIds: string[];
  fulfillmentOther: string;
  fulfillmentDetail: string;
  systemsOptionIds: string[];
  systemsOther: string;
  systemsDetail: string;
  bottleneckOptionIds: string[];
  bottleneckCustomItems: string[];
  bottleneckCustomInput: string;
  goalResponses: Record<string, string>;
  customGoals: string[];
  customGoalInput: string;
}

const STEP_ORDER: ServiceIntakeStepId[] = [
  "teamSize",
  "fulfillmentSetup",
  "systems",
  "bottlenecks",
  "goals",
];

const STEP_LABELS: Record<ServiceIntakeStepId, string> = {
  teamSize: "Team Size",
  fulfillmentSetup: "Fulfillment Setup",
  systems: "Core Systems",
  bottlenecks: "Bottlenecks",
  goals: "Goals",
};

function normalizeText(value?: string | null): string {
  return value?.trim() || "";
}

function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getActiveOptions(question: ServiceIntakeQuestionConfig) {
  return question.options.filter((option) => option.active);
}

function stripLabelPrefix(value: string, label: string): string {
  const normalizedValue = normalizeForMatch(value);
  const normalizedLabel = normalizeForMatch(label);

  if (!normalizedValue.startsWith(normalizedLabel)) {
    return value.trim();
  }

  const rawRemainder = value.slice(label.length).trim();
  return rawRemainder.replace(/^[-:—,]+/, "").trim();
}

function parseTeamSizeState(
  question: ServiceIntakeQuestionConfig,
  value?: string
): Pick<WizardState, "teamSizeOptionId" | "teamSizeDetail"> {
  const raw = normalizeText(value);
  if (!raw) {
    return { teamSizeOptionId: null, teamSizeDetail: "" };
  }

  const match = question.options.find((option) =>
    normalizeForMatch(raw).includes(normalizeForMatch(option.label))
  );

  if (!match) {
    return { teamSizeOptionId: null, teamSizeDetail: raw };
  }

  const detail = stripLabelPrefix(raw, match.label);
  return {
    teamSizeOptionId: match.id,
    teamSizeDetail: detail === match.label ? "" : detail,
  };
}

function parseMultiSelectState(
  question: ServiceIntakeQuestionConfig,
  value?: string
): {
  selectedIds: string[];
  otherText: string;
  detail: string;
} {
  const raw = normalizeText(value);
  if (!raw) {
    return { selectedIds: [], otherText: "", detail: "" };
  }

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const selectedIds = question.options
    .filter((option) =>
      normalizeForMatch(raw).includes(normalizeForMatch(option.label))
    )
    .map((option) => option.id);

  const otherLine = lines.find((line) =>
    line.toLowerCase().startsWith("other:")
  );
  const detailLine = lines.find((line) =>
    line.toLowerCase().startsWith("notes:")
  );

  return {
    selectedIds,
    otherText: otherLine ? otherLine.replace(/^other:\s*/i, "").trim() : "",
    detail: detailLine ? detailLine.replace(/^notes:\s*/i, "").trim() : "",
  };
}

function parseBottleneckState(
  question: ServiceIntakeQuestionConfig,
  value?: string[]
): Pick<
  WizardState,
  "bottleneckOptionIds" | "bottleneckCustomItems" | "bottleneckCustomInput"
> {
  const selectedIds: string[] = [];
  const customItems: string[] = [];

  for (const item of value || []) {
    const raw = normalizeText(item);
    if (!raw) continue;

    const match = question.options.find(
      (option) => normalizeForMatch(option.label) === normalizeForMatch(raw)
    );

    if (match) {
      selectedIds.push(match.id);
    } else {
      customItems.push(raw);
    }
  }

  return {
    bottleneckOptionIds: selectedIds,
    bottleneckCustomItems: customItems,
    bottleneckCustomInput: "",
  };
}

function parseGoalState(
  question: ServiceIntakeQuestionConfig,
  value?: string
): Pick<WizardState, "goalResponses" | "customGoals" | "customGoalInput"> {
  const goalResponses: Record<string, string> = {};
  const customGoals: string[] = [];
  const raw = normalizeText(value);

  if (!raw) {
    return { goalResponses, customGoals, customGoalInput: "" };
  }

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const match = question.options.find((option) =>
      normalizeForMatch(line).startsWith(`${normalizeForMatch(option.label)} `)
    );

    if (match) {
      const response = line.slice(match.label.length).replace(/^:\s*/, "").trim();
      goalResponses[match.id] = response;
    } else {
      customGoals.push(line);
    }
  }

  return {
    goalResponses,
    customGoals,
    customGoalInput: "",
  };
}

function createWizardState(context: ServiceIntakeContext): WizardState {
  const { questions } = context.config;

  return {
    ...parseTeamSizeState(questions.teamSize, context.intakeResponses?.teamSize),
    ...(() => {
      const state = parseMultiSelectState(
        questions.fulfillmentSetup,
        context.intakeResponses?.fulfillmentSetup
      );
      return {
        fulfillmentOptionIds: state.selectedIds,
        fulfillmentOther: state.otherText,
        fulfillmentDetail: state.detail,
      };
    })(),
    ...(() => {
      const state = parseMultiSelectState(
        questions.systems,
        context.intakeResponses?.systems
      );
      return {
        systemsOptionIds: state.selectedIds,
        systemsOther: state.otherText,
        systemsDetail: state.detail,
      };
    })(),
    ...parseBottleneckState(
      questions.bottlenecks,
      context.intakeResponses?.topProblems
    ),
    ...parseGoalState(questions.goals, context.intakeResponses?.goals),
  };
}

function buildTeamSizeValue(
  question: ServiceIntakeQuestionConfig,
  state: WizardState
): string {
  const selected = question.options.find(
    (option) => option.id === state.teamSizeOptionId
  );
  if (!selected) return normalizeText(state.teamSizeDetail);

  return state.teamSizeDetail.trim()
    ? `${selected.label} — ${state.teamSizeDetail.trim()}`
    : selected.label;
}

function buildMultiValue(
  question: ServiceIntakeQuestionConfig,
  selectedIds: string[],
  otherText: string,
  detail: string
): string {
  const selectedLabels = question.options
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.label);
  const parts: string[] = [];

  if (selectedLabels.length > 0) {
    parts.push(selectedLabels.join(", "));
  }
  if (otherText.trim()) {
    parts.push(`Other: ${otherText.trim()}`);
  }
  if (detail.trim()) {
    parts.push(`Notes: ${detail.trim()}`);
  }

  return parts.join("\n").trim();
}

function buildBottleneckValues(
  question: ServiceIntakeQuestionConfig,
  state: WizardState
): string[] {
  const selectedLabels = question.options
    .filter((option) => state.bottleneckOptionIds.includes(option.id))
    .map((option) => option.label);

  return [...selectedLabels, ...state.bottleneckCustomItems.map((item) => item.trim())]
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildGoalsValue(
  question: ServiceIntakeQuestionConfig,
  state: WizardState
): string {
  const parts = question.options
    .filter((option) => normalizeText(state.goalResponses[option.id]))
    .map(
      (option) => `${option.label}: ${normalizeText(state.goalResponses[option.id])}`
    );

  return [...parts, ...state.customGoals.map((item) => item.trim())]
    .filter(Boolean)
    .join("\n");
}

function isStepComplete(
  stepId: ServiceIntakeStepId,
  context: ServiceIntakeContext,
  state: WizardState
): boolean {
  switch (stepId) {
    case "teamSize":
      return Boolean(state.teamSizeOptionId);
    case "fulfillmentSetup":
      return (
        state.fulfillmentOptionIds.length > 0 ||
        Boolean(normalizeText(state.fulfillmentOther))
      );
    case "systems":
      return (
        state.systemsOptionIds.length > 0 ||
        Boolean(normalizeText(state.systemsOther))
      );
    case "bottlenecks":
      return buildBottleneckValues(context.config.questions.bottlenecks, state).length > 0;
    case "goals":
      return Boolean(
        buildGoalsValue(context.config.questions.goals, state).trim()
      );
    default:
      return false;
  }
}

function getFirstIncompleteStepIndex(
  context: ServiceIntakeContext,
  state: WizardState
): number {
  const nextIndex = STEP_ORDER.findIndex(
    (stepId) => !isStepComplete(stepId, context, state)
  );
  return nextIndex >= 0 ? nextIndex : STEP_ORDER.length - 1;
}

function iconForKey(iconKey: string, className = "h-5 w-5") {
  switch (iconKey) {
    case "user":
      return <IconUser className={className} />;
    case "users":
      return <IconUsers className={className} />;
    case "workflow":
      return <IconWorkflow className={className} />;
    case "clipboard":
      return <IconClipboard className={className} />;
    case "storefront":
      return <IconStorefront className={className} />;
    case "integration":
      return <IconIntegration className={className} />;
    case "shopping_bag":
      return <IconShoppingBag className={className} />;
    case "map":
      return <IconMap className={className} />;
    case "chat":
      return <IconChat className={className} />;
    case "chart":
      return <IconChart className={className} />;
    case "catalog":
      return <IconCatalog className={className} />;
    case "wrench":
      return <IconWrench className={className} />;
    case "eye":
      return <IconEye className={className} />;
    case "bolt":
      return <IconBolt className={className} />;
    case "trending_up":
      return <IconTrendingUp className={className} />;
    case "shield":
      return <IconShield className={className} />;
    default:
      return <IconClipboard className={className} />;
  }
}

function SummaryBlock({
  label,
  value,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="border-l-2 border-border pl-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <div
        className={`mt-2 text-sm leading-relaxed ${
          muted ? "text-muted" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function ServiceIntakeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const lastSavedFingerprintRef = useRef<string | null>(null);

  const [context, setContext] = useState<ServiceIntakeContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "dirty" | "saving" | "saved" | "error"
  >("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [wizard, setWizard] = useState<WizardState | null>(null);

  useEffect(() => {
    if (!token) {
      setLoadError("Missing intake link.");
      setLoading(false);
      return;
    }

    fetch(`/api/service-intake/context?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error || "Unable to load intake");
        }
        return body as ServiceIntakeContext;
      })
      .then((data) => {
        const initialState = createWizardState(data);
        setContext(data);
        setWizard(initialState);
        setCurrentStepIndex(getFirstIncompleteStepIndex(data, initialState));
      })
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Unable to load intake"
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  const currentStep = STEP_ORDER[currentStepIndex];
  const currentQuestion = context?.config.questions[currentStep];

  const completionMap = useMemo(() => {
    if (!context || !wizard) return {} as Record<ServiceIntakeStepId, boolean>;

    return STEP_ORDER.reduce(
      (acc, stepId) => ({
        ...acc,
        [stepId]: isStepComplete(stepId, context, wizard),
      }),
      {} as Record<ServiceIntakeStepId, boolean>
    );
  }, [context, wizard]);

  const storeLabel = useMemo(() => {
    if (!context) return "";
    return context.storeName?.trim() || context.siteUrl;
  }, [context]);

  const derivedValues = useMemo(() => {
    if (!context || !wizard) {
      return {
        teamSizeValue: "",
        fulfillmentValue: "",
        systemsValue: "",
        topProblemValues: [] as string[],
        goalsValue: "",
      };
    }

    return {
      teamSizeValue: buildTeamSizeValue(context.config.questions.teamSize, wizard),
      fulfillmentValue: buildMultiValue(
        context.config.questions.fulfillmentSetup,
        wizard.fulfillmentOptionIds,
        wizard.fulfillmentOther,
        wizard.fulfillmentDetail
      ),
      systemsValue: buildMultiValue(
        context.config.questions.systems,
        wizard.systemsOptionIds,
        wizard.systemsOther,
        wizard.systemsDetail
      ),
      topProblemValues: buildBottleneckValues(
        context.config.questions.bottlenecks,
        wizard
      ),
      goalsValue: buildGoalsValue(context.config.questions.goals, wizard),
    };
  }, [context, wizard]);

  const draftFingerprint = useMemo(
    () =>
      JSON.stringify({
        teamSize: derivedValues.teamSizeValue,
        fulfillmentSetup: derivedValues.fulfillmentValue,
        systems: derivedValues.systemsValue,
        topProblems: derivedValues.topProblemValues,
        goals: derivedValues.goalsValue,
      }),
    [derivedValues]
  );

  const saveStatusText = useMemo(() => {
    if (saveStatus === "saving") {
      return "Saving changes...";
    }

    if (saveStatus === "dirty") {
      return "Changes not saved yet";
    }

    if (saveStatus === "saved") {
      if (!lastSavedAt) {
        return "Changes saved";
      }

      return `Saved ${new Date(lastSavedAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }

    if (saveStatus === "error") {
      return saveError || "Unable to save progress";
    }

    return "Progress saves automatically";
  }, [lastSavedAt, saveError, saveStatus]);

  const saveDraft = useCallback(
    async (options?: { autosave?: boolean }): Promise<boolean> => {
      if (!token || !context || !wizard) return false;
      if (lastSavedFingerprintRef.current === draftFingerprint) {
        if (!options?.autosave) {
          setSaveStatus("saved");
        }
        return true;
      }

      setSavingDraft(true);
      setSaveError(null);
      setSaveStatus("saving");

      try {
        const res = await fetch("/api/service-intake/save-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            teamSize: derivedValues.teamSizeValue,
            fulfillmentSetup: derivedValues.fulfillmentValue,
            systems: derivedValues.systemsValue,
            topProblems: derivedValues.topProblemValues,
            goals: derivedValues.goalsValue,
          }),
        });

        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error || "Unable to save your progress");
        }

        lastSavedFingerprintRef.current = draftFingerprint;
        setLastSavedAt(new Date().toISOString());
        setSaveStatus("saved");
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to save your progress";
        setSaveError(message);
        setSaveStatus("error");
        return false;
      } finally {
        setSavingDraft(false);
      }
    },
    [context, derivedValues, draftFingerprint, token, wizard]
  );

  useEffect(() => {
    if (!context || !wizard || !token) return;

    if (lastSavedFingerprintRef.current === null) {
      lastSavedFingerprintRef.current = draftFingerprint;
    }
  }, [context, draftFingerprint, token, wizard]);

  useEffect(() => {
    if (!context || !wizard || !token || submitted) return;
    if (lastSavedFingerprintRef.current === null) return;
    if (draftFingerprint === lastSavedFingerprintRef.current) return;

    setSaveStatus((current) => (current === "saving" ? current : "dirty"));
    setSaveError(null);

    if (savingDraft) return;

    const timeout = window.setTimeout(() => {
      void saveDraft({ autosave: true });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [context, draftFingerprint, saveDraft, savingDraft, submitted, token, wizard]);

  useEffect(() => {
    if (saveStatus !== "dirty" && saveStatus !== "saving") return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  function validateCurrentStep(): string | null {
    if (!context || !wizard) return "Intake is not ready yet.";

    switch (currentStep) {
      case "teamSize":
        return wizard.teamSizeOptionId ? null : "Choose the team size that fits best.";
      case "fulfillmentSetup":
        return wizard.fulfillmentOptionIds.length > 0 ||
          normalizeText(wizard.fulfillmentOther)
          ? null
          : "Select at least one fulfillment pattern or add another setup.";
      case "systems":
        return wizard.systemsOptionIds.length > 0 ||
          normalizeText(wizard.systemsOther)
          ? null
          : "Select at least one core system or add another platform.";
      case "bottlenecks":
        return derivedValues.topProblemValues.length > 0
          ? null
          : "Select at least one bottleneck or add a custom friction point.";
      case "goals":
        return derivedValues.goalsValue
          ? null
          : "Add at least one goal for the next 90 days.";
      default:
        return null;
    }
  }

  async function handleContinue() {
    const error = validateCurrentStep();
    setStepError(error);

    if (error) return;

    const saved = await saveDraft();
    if (!saved) return;

    if (currentStepIndex === STEP_ORDER.length - 1) {
      await handleSubmit();
      return;
    }

    setCurrentStepIndex((value) => Math.min(value + 1, STEP_ORDER.length - 1));
    setStepError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!token) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/service-intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          teamSize: derivedValues.teamSizeValue,
          fulfillmentSetup: derivedValues.fulfillmentValue,
          systems: derivedValues.systemsValue,
          topProblems: derivedValues.topProblemValues,
          goals: derivedValues.goalsValue,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Unable to submit intake");
      }

      setSubmitted(true);
      setContext((current) =>
        current
          ? {
              ...current,
              status: "intake_received",
            }
          : current
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Unable to submit intake"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveExit() {
    const saved = await saveDraft();
    if (!saved) return;
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex-1 bg-background px-6 pb-20 pt-32">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-4 h-10 w-72 rounded bg-border" />
          <div className="mb-10 h-4 w-96 rounded bg-border" />
          <div className="h-[620px] rounded-xl bg-border" />
        </div>
      </main>
    );
  }

  if (loadError || !context || !wizard || !currentQuestion) {
    return (
      <main className="flex-1 bg-background px-6 pb-20 pt-32">
        <section className="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground">
            Intake link unavailable
          </h1>
          <p className="text-sm leading-relaxed text-amber-900">
            {loadError || "This intake link is no longer available."}
          </p>
        </section>
      </main>
    );
  }

  const currentStepNumber = currentStepIndex + 1;

  const teamSizeSummary = derivedValues.teamSizeValue || "Pending";
  const fulfillmentSummary = derivedValues.fulfillmentValue || "Pending";
  const systemsSummary = derivedValues.systemsValue || "Pending";
  const bottleneckSummary = derivedValues.topProblemValues.length
    ? derivedValues.topProblemValues.join(", ")
    : "Pending";
  const goalsSummary = derivedValues.goalsValue || "Pending";
  const selectedBottleneckCount = derivedValues.topProblemValues.length;
  const activeGoalCount = Object.values(wizard.goalResponses).filter((value) =>
    Boolean(normalizeText(value))
  ).length;
  const selectedGoalLabels = currentStep === "goals"
    ? context.config.questions.goals.options
        .filter((option) => normalizeText(wizard.goalResponses[option.id]))
        .map((option) => option.label)
    : [];

  return (
    <main className="flex-1 bg-background px-6 pb-20 pt-32">
      <section className="mx-auto max-w-[1560px]">
        {submitted ? (
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <IconCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mb-3 text-3xl font-bold text-foreground">
              Intake received
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted">
              Your responses are saved. We will use them to prepare the next
              stage of your Shopify operations review for {storeLabel}.
            </p>
            {context.meetingAt && (
              <p className="mt-5 text-sm text-foreground">
                Session time: {new Date(context.meetingAt).toLocaleString()}
              </p>
            )}
            {context.meetingUrl && (
              <a
                href={context.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:text-accent"
              >
                <IconCalendar className="h-4 w-4" />
                Open meeting link
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="xl:sticky xl:top-28 xl:self-start">
              <div className="rounded-2xl bg-section-alt p-6">
                <p className="text-3xl font-bold text-foreground">Engagement</p>
                <p className="mt-1 text-sm text-muted">
                  {completionMap.goals ? "Reviewing" : "In progress"}
                </p>

                <div className="mt-8 space-y-2">
                  {STEP_ORDER.map((stepId, index) => {
                    const isCurrent = stepId === currentStep;
                    const isComplete = completionMap[stepId];

                    return (
                      <button
                        key={stepId}
                        type="button"
                        onClick={() => {
                          setCurrentStepIndex(index);
                          setStepError(null);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                          isCurrent
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted hover:bg-white/60 hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                            isComplete
                              ? "border-primary bg-primary text-white"
                              : isCurrent
                                ? "border-primary text-primary"
                                : "border-border text-muted"
                          }`}
                        >
                          {isComplete ? (
                            <IconCheck className="h-3.5 w-3.5" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">
                            {STEP_LABELS[stepId]}
                          </p>
                          <p className="text-xs text-muted">
                            {isComplete ? "Ready" : "Pending"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-10">
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                    Step {currentStepNumber} of {STEP_ORDER.length}
                  </p>
                  <h1 className="text-4xl font-bold text-foreground md:text-5xl">
                    {currentQuestion.title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
                    {currentQuestion.subtitle}
                  </p>
                  <p className="mt-3 text-sm font-medium text-muted">
                    {saveStatusText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSaveExit()}
                  disabled={savingDraft || submitting}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:text-accent disabled:opacity-60"
                >
                  {savingDraft ? "Saving..." : "Save & Exit"}
                </button>
              </div>

              {currentStep === "teamSize" && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {getActiveOptions(currentQuestion).map((option) => {
                      const selected = wizard.teamSizeOptionId === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setWizard((current) =>
                              current
                                ? {
                                    ...current,
                                    teamSizeOptionId: option.id,
                                  }
                                : current
                            )
                          }
                          className={`rounded-2xl border p-6 text-left transition-colors ${
                            selected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="mb-5 flex items-center justify-between gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              {iconForKey(option.iconKey)}
                            </div>
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-primary bg-primary text-white"
                                  : "border-border"
                              }`}
                            >
                              {selected && <IconCheck className="h-4 w-4" />}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-foreground">
                            {option.label}
                          </p>
                          <p className="mt-2 text-base leading-relaxed text-muted">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {currentQuestion.allowDetail && wizard.teamSizeOptionId && (
                    <div className="mt-8">
                      <label className="mb-2 block text-base font-semibold text-foreground">
                        {currentQuestion.detailLabel || "Additional details"}
                      </label>
                      <textarea
                        value={wizard.teamSizeDetail}
                        onChange={(e) =>
                          setWizard((current) =>
                            current
                              ? {
                                  ...current,
                                  teamSizeDetail: e.target.value,
                                }
                              : current
                          )
                        }
                        rows={4}
                        placeholder={
                          currentQuestion.detailPlaceholder ||
                          "Add context that would help us understand your setup."
                        }
                        className="w-full resize-none rounded-xl border border-border px-5 py-4 text-base text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </>
              )}

              {currentStep === "fulfillmentSetup" && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {getActiveOptions(currentQuestion).map((option) => {
                      const selected = wizard.fulfillmentOptionIds.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setWizard((current) =>
                              current
                                ? {
                                    ...current,
                                    fulfillmentOptionIds: selected
                                      ? current.fulfillmentOptionIds.filter(
                                          (id) => id !== option.id
                                        )
                                      : [...current.fulfillmentOptionIds, option.id],
                                  }
                                : current
                            )
                          }
                          className={`rounded-2xl border p-5 text-left transition-colors ${
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              {iconForKey(option.iconKey)}
                            </div>
                            {selected && (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                                <IconCheck className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          <p className="text-xl font-bold text-foreground">
                            {option.label}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-muted">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {currentQuestion.allowCustom && (
                      <div>
                        <label className="mb-2 block text-base font-semibold text-foreground">
                          {currentQuestion.customInputLabel || "Other"}
                        </label>
                        <input
                          type="text"
                          value={wizard.fulfillmentOther}
                          onChange={(e) =>
                            setWizard((current) =>
                              current
                                ? {
                                    ...current,
                                    fulfillmentOther: e.target.value,
                                  }
                                : current
                            )
                          }
                          placeholder={
                            currentQuestion.customInputPlaceholder ||
                            "Describe another fulfillment model"
                          }
                          className="w-full rounded-xl border border-border px-5 py-4 text-base text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}

                    {currentQuestion.allowDetail && (
                      <div>
                        <label className="mb-2 block text-base font-semibold text-foreground">
                          {currentQuestion.detailLabel || "Notes"}
                        </label>
                        <textarea
                          value={wizard.fulfillmentDetail}
                          onChange={(e) =>
                            setWizard((current) =>
                              current
                                ? {
                                    ...current,
                                    fulfillmentDetail: e.target.value,
                                  }
                                : current
                            )
                          }
                          rows={4}
                          placeholder={
                            currentQuestion.detailPlaceholder ||
                            "Add context on exceptions and friction points."
                          }
                          className="w-full resize-none rounded-xl border border-border px-5 py-4 text-base text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {currentStep === "systems" && (
                <>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {getActiveOptions(currentQuestion).map((option) => {
                      const selected = wizard.systemsOptionIds.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setWizard((current) =>
                              current
                                ? {
                                    ...current,
                                    systemsOptionIds: selected
                                      ? current.systemsOptionIds.filter(
                                          (id) => id !== option.id
                                        )
                                      : [...current.systemsOptionIds, option.id],
                                  }
                                : current
                            )
                          }
                          className={`rounded-2xl border p-7 text-left transition-colors ${
                            selected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="mb-5 flex items-center justify-between gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              {iconForKey(option.iconKey)}
                            </div>
                            {selected && (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                                <IconCheck className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          <p className="text-2xl font-bold text-foreground">
                            {option.label}
                          </p>
                          <p className="mt-2 text-base leading-relaxed text-muted">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}

                    {currentQuestion.allowCustom && (
                      <div className="rounded-2xl border border-dashed border-border p-7">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <span className="text-2xl font-semibold">+</span>
                        </div>
                        <p className="mt-5 text-2xl font-bold text-foreground">
                          Other
                        </p>
                        <p className="mt-2 text-base leading-relaxed text-muted">
                          Add a platform that is specific to your stack.
                        </p>
                        <input
                          type="text"
                          value={wizard.systemsOther}
                          onChange={(e) =>
                            setWizard((current) =>
                              current
                                ? {
                                    ...current,
                                    systemsOther: e.target.value,
                                  }
                                : current
                            )
                          }
                          placeholder={
                            currentQuestion.customInputPlaceholder ||
                            "Specify another system"
                          }
                          className="mt-5 w-full rounded-xl border border-border px-4 py-3 text-base text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>

                  {currentQuestion.allowDetail && (
                    <div className="mt-8">
                      <label className="mb-2 block text-base font-semibold text-foreground">
                        {currentQuestion.detailLabel || "Systems notes"}
                      </label>
                      <textarea
                        value={wizard.systemsDetail}
                        onChange={(e) =>
                          setWizard((current) =>
                            current
                              ? {
                                  ...current,
                                  systemsDetail: e.target.value,
                                }
                              : current
                          )
                        }
                        rows={4}
                        placeholder={
                          currentQuestion.detailPlaceholder ||
                          "Add context on integrations and brittle handoffs."
                        }
                        className="w-full resize-none rounded-xl border border-border px-5 py-4 text-base text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </>
              )}

              {currentStep === "bottlenecks" && (
                <>
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div>
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                            Priority Map
                          </p>
                          <p className="mt-2 text-base leading-relaxed text-muted">
                            Pick the friction points that slow execution most often.
                          </p>
                        </div>
                        <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                          {selectedBottleneckCount} selected
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {getActiveOptions(currentQuestion).map((option) => {
                          const selected = wizard.bottleneckOptionIds.includes(
                            option.id
                          );

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() =>
                                setWizard((current) =>
                                  current
                                    ? {
                                        ...current,
                                        bottleneckOptionIds: selected
                                          ? current.bottleneckOptionIds.filter(
                                              (id) => id !== option.id
                                            )
                                          : [
                                              ...current.bottleneckOptionIds,
                                              option.id,
                                            ],
                                      }
                                    : current
                                )
                              }
                              className={`rounded-2xl border p-5 text-left transition-colors ${
                                selected
                                  ? "border-primary bg-primary text-white"
                                  : "border-border bg-white hover:border-primary/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <span
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                    selected
                                      ? "bg-white/15 text-white"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {iconForKey(option.iconKey, "h-5 w-5")}
                                </span>
                                {selected && (
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white">
                                    <IconCheck className="h-4 w-4" />
                                  </span>
                                )}
                              </div>
                              <div className="mt-5">
                                <span className="block text-lg font-semibold">
                                  {option.label}
                                </span>
                                <span
                                  className={`mt-2 block text-sm leading-relaxed ${
                                    selected ? "text-white/75" : "text-muted"
                                  }`}
                                >
                                  {option.description}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {wizard.bottleneckCustomItems.length > 0 && (
                        <div className="mt-6 rounded-2xl border border-border bg-section-alt p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                            Custom bottlenecks
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            {wizard.bottleneckCustomItems.map((item) => (
                              <div
                                key={item}
                                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setWizard((current) =>
                                      current
                                        ? {
                                            ...current,
                                            bottleneckCustomItems:
                                              current.bottleneckCustomItems.filter(
                                                (entry) => entry !== item
                                              ),
                                          }
                                        : current
                                    )
                                  }
                                  className="text-primary/70 hover:text-primary"
                                >
                                  <IconX className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          Throughput View
                        </p>
                        <p className="mt-3 text-2xl font-bold text-foreground">
                          Surface the blockers before they calcify into routine.
                        </p>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                          The most useful audit starts with repeated friction, not edge cases.
                          Select the issues that create the most rework, uncertainty, or delay.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-2xl border border-border bg-section-alt p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                          {currentQuestion.customInputLabel || "Add custom bottleneck"}
                        </p>
                        <div className="mt-4 flex gap-3">
                          <input
                            type="text"
                            value={wizard.bottleneckCustomInput}
                            onChange={(e) =>
                              setWizard((current) =>
                                current
                                  ? {
                                      ...current,
                                      bottleneckCustomInput: e.target.value,
                                    }
                                  : current
                              )
                            }
                            placeholder={
                              currentQuestion.customInputPlaceholder ||
                              "Describe a specific friction point..."
                            }
                            className="flex-1 rounded-xl border border-border px-4 py-3 text-base text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const value = normalizeText(
                                wizard.bottleneckCustomInput
                              );
                              if (!value) return;
                              setWizard((current) =>
                                current
                                  ? {
                                      ...current,
                                      bottleneckCustomItems:
                                        current.bottleneckCustomItems.includes(
                                          value
                                        )
                                          ? current.bottleneckCustomItems
                                          : [...current.bottleneckCustomItems, value],
                                      bottleneckCustomInput: "",
                                    }
                                  : current
                              );
                            }}
                            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                        <p className="text-base font-semibold text-foreground">
                          Why this matters
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted">
                          Mapping operational drag helps us prioritize the places
                          where small fixes can unlock clearer throughput and
                          less day-to-day friction.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-white p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                          Current priorities
                        </p>
                        {selectedBottleneckCount > 0 ? (
                          <ul className="mt-4 space-y-3">
                            {derivedValues.topProblemValues.map((item) => (
                              <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-4 text-sm leading-relaxed text-muted">
                            Selected bottlenecks will appear here as you build the priority set.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === "goals" && (
                <>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                        Final Phase
                      </p>
                      <p className="mt-2 text-base leading-relaxed text-muted">
                        Define the outcomes that should shape the audit recommendations.
                      </p>
                    </div>
                    <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                      {activeGoalCount} active goals
                    </div>
                  </div>

                  <div className="space-y-5">
                    {getActiveOptions(currentQuestion).map((option) => {
                      const response = wizard.goalResponses[option.id] || "";
                      const active = Boolean(response) || option.id in wizard.goalResponses;

                      return (
                        <div
                          key={option.id}
                          className={`rounded-2xl border p-6 transition-colors ${
                            active
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                {iconForKey(option.iconKey)}
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-foreground">
                                  {option.label}
                                </p>
                                <p className="mt-1 text-base leading-relaxed text-muted">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setWizard((current) => {
                                  if (!current) return current;
                                  const nextResponses = { ...current.goalResponses };
                                  if (option.id in nextResponses) {
                                    delete nextResponses[option.id];
                                  } else {
                                    nextResponses[option.id] = "";
                                  }
                                  return {
                                    ...current,
                                    goalResponses: nextResponses,
                                  };
                                })
                              }
                              className={`flex h-8 w-8 items-center justify-center rounded-full border text-lg font-semibold ${
                                active
                                  ? "border-primary bg-primary text-white"
                                  : "border-border text-muted"
                              }`}
                            >
                              {active ? "−" : "+"}
                            </button>
                          </div>

                          {active && (
                            <div className="mt-6">
                              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                                {option.promptLabel || "Target"}
                              </label>
                              <textarea
                                value={response}
                                onChange={(e) =>
                                  setWizard((current) =>
                                    current
                                      ? {
                                          ...current,
                                          goalResponses: {
                                            ...current.goalResponses,
                                            [option.id]: e.target.value,
                                          },
                                        }
                                      : current
                                  )
                                }
                                rows={3}
                                placeholder={
                                  option.placeholder ||
                                  "Describe the result you want to reach."
                                }
                                className="w-full resize-none rounded-xl border border-border px-5 py-4 text-base text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {selectedGoalLabels.length > 0 && (
                      <div className="rounded-2xl border border-border bg-section-alt p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                          Selected focus areas
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {selectedGoalLabels.map((label) => (
                            <span
                              key={label}
                              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {wizard.customGoals.length > 0 && (
                      <div className="space-y-3">
                        {wizard.customGoals.map((goal) => (
                          <div
                            key={goal}
                            className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3"
                          >
                            <p className="text-sm font-medium text-foreground">
                              {goal}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setWizard((current) =>
                                  current
                                    ? {
                                        ...current,
                                        customGoals: current.customGoals.filter(
                                          (item) => item !== goal
                                        ),
                                      }
                                    : current
                                )
                              }
                              className="text-muted hover:text-foreground"
                            >
                              <IconX className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentQuestion.allowCustom && (
                      <div className="rounded-2xl border border-dashed border-border bg-section-alt/40 p-6">
                        <button
                          type="button"
                          onClick={() => {
                            const value = normalizeText(wizard.customGoalInput);
                            if (!value) return;
                            setWizard((current) =>
                              current
                                ? {
                                    ...current,
                                    customGoals: current.customGoals.includes(value)
                                      ? current.customGoals
                                      : [...current.customGoals, value],
                                    customGoalInput: "",
                                  }
                                : current
                            );
                          }}
                          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl font-semibold text-primary"
                        >
                          +
                        </button>
                        <p className="text-xl font-bold text-foreground">
                          {currentQuestion.customInputLabel || "Define Custom Objective"}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          Add a target that does not fit the standard goal set.
                        </p>
                        <input
                          type="text"
                          value={wizard.customGoalInput}
                          onChange={(e) =>
                            setWizard((current) =>
                              current
                                ? {
                                    ...current,
                                    customGoalInput: e.target.value,
                                  }
                                : current
                            )
                          }
                          placeholder={
                            currentQuestion.customInputPlaceholder ||
                            "Add another goal area"
                          }
                          className="mt-4 w-full rounded-xl border border-border px-5 py-4 text-base text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStepIndex((value) => Math.max(value - 1, 0));
                    setStepError(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentStepIndex === 0 || savingDraft || submitting}
                  className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  &larr; Go Back
                </button>

                <div className="flex-1 text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {STEP_LABELS[currentStep]}
                </div>

                <button
                  type="button"
                  onClick={() => void handleContinue()}
                  disabled={savingDraft || submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
                >
                  {currentStepIndex === STEP_ORDER.length - 1
                    ? submitting
                      ? "Submitting..."
                      : "Submit Intake"
                    : savingDraft
                      ? "Saving..."
                      : "Continue"}
                  <IconArrowRight className="h-4 w-4" />
                </button>
              </div>

              {(stepError || saveError || submitError) && (
                <div className="mt-4 space-y-2">
                  {stepError && <p className="text-sm text-red-600">{stepError}</p>}
                  {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                  {submitError && (
                    <p className="text-sm text-red-600">{submitError}</p>
                  )}
                </div>
              )}
            </div>

            <aside className="xl:sticky xl:top-28 xl:self-start">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-2xl font-bold text-foreground">
                    Current engagement
                  </h2>
                  <div className="space-y-3 text-sm">
                    <p className="text-foreground">
                      <span className="text-muted">Store:</span> {context.siteUrl}
                    </p>
                    <p className="text-foreground">
                      <span className="text-muted">Email:</span> {context.email}
                    </p>
                    <p className="text-foreground">
                      <span className="text-muted">Status:</span>{" "}
                      {context.status.replace(/_/g, " ")}
                    </p>
                    {context.meetingAt && (
                      <p className="text-foreground">
                        <span className="text-muted">Session:</span>{" "}
                        {new Date(context.meetingAt).toLocaleString()}
                      </p>
                    )}
                    {context.meetingUrl && (
                      <a
                        href={context.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent"
                      >
                        <IconCalendar className="h-4 w-4" />
                        Open meeting link
                      </a>
                    )}
                  </div>

                  {context.prioritySummary && (
                    <div className="mt-5 rounded-xl bg-primary/5 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        Current focus
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                        {context.prioritySummary}
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <IconGlobe className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        Live summary
                      </p>
                      <p className="text-sm text-muted">
                        {storeLabel}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <SummaryBlock
                      label="Team Size"
                      value={teamSizeSummary}
                      muted={teamSizeSummary === "Pending"}
                    />
                    <SummaryBlock
                      label="Fulfillment Setup"
                      value={fulfillmentSummary}
                      muted={fulfillmentSummary === "Pending"}
                    />
                    <SummaryBlock
                      label="Core Systems"
                      value={systemsSummary}
                      muted={systemsSummary === "Pending"}
                    />
                    <SummaryBlock
                      label="Bottlenecks"
                      value={bottleneckSummary}
                      muted={bottleneckSummary === "Pending"}
                    />
                    <SummaryBlock
                      label="Goals"
                      value={goalsSummary}
                      muted={goalsSummary === "Pending"}
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ServiceIntakePage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="flex-1 bg-background px-6 pb-20 pt-32">
            <div className="mx-auto max-w-4xl text-center text-muted">
              Loading...
            </div>
          </main>
        }
      >
        <ServiceIntakeContent />
      </Suspense>
      <Footer />
    </>
  );
}
