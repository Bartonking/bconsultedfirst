"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  BookingSiteConfig,
  ServiceIntakeConfig,
  ServiceIntakeOption,
  ServiceIntakeQuestionConfig,
  ServiceIntakeStepId,
} from "@/lib/types";
import {
  DEFAULT_BOOKING_CONFIG,
  getBookingPriceLabel,
} from "@/lib/public-site-config";

const SERVICE_INTAKE_STEP_ORDER: ServiceIntakeStepId[] = [
  "teamSize",
  "fulfillmentSetup",
  "systems",
  "bottlenecks",
  "goals",
];

const STEP_LABELS: Record<ServiceIntakeStepId, string> = {
  teamSize: "Team Size",
  fulfillmentSetup: "Fulfillment Setup",
  systems: "Systems",
  bottlenecks: "Bottlenecks",
  goals: "Goals",
};

function createOption(stepId: ServiceIntakeStepId): ServiceIntakeOption {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: `${stepId}-${suffix}`,
    label: "",
    description: "",
    iconKey: "clipboard",
    active: true,
    source: "admin",
    ...(stepId === "goals"
      ? {
          promptLabel: "",
          placeholder: "",
        }
      : {}),
  };
}

export default function ServiceIntakeConfigPage() {
  const [config, setConfig] = useState<ServiceIntakeConfig | null>(null);
  const [bookingConfig, setBookingConfig] =
    useState<BookingSiteConfig>(DEFAULT_BOOKING_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/service-intake-config").then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Failed to load config");
        return body.config as ServiceIntakeConfig;
      }),
      fetch("/api/admin/site-config/booking").then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error || "Failed to load booking config");
        }
        return body.config as BookingSiteConfig;
      }),
    ])
      .then(([nextConfig, nextBookingConfig]) => {
        setConfig(nextConfig);
        setBookingConfig(nextBookingConfig);
      })
      .catch((err) => {
        setSaveError(
          err instanceof Error ? err.message : "Failed to load config"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  function updateQuestion(
    stepId: ServiceIntakeStepId,
    updater: (current: ServiceIntakeQuestionConfig) => ServiceIntakeQuestionConfig
  ) {
    setConfig((current) =>
      current
        ? {
            ...current,
            questions: {
              ...current.questions,
              [stepId]: updater(current.questions[stepId]),
            },
          }
        : current
    );
  }

  function updateOption(
    stepId: ServiceIntakeStepId,
    optionId: string,
    updater: (current: ServiceIntakeOption) => ServiceIntakeOption
  ) {
    updateQuestion(stepId, (question) => ({
      ...question,
      options: question.options.map((option) =>
        option.id === optionId ? updater(option) : option
      ),
    }));
  }

  function addOption(stepId: ServiceIntakeStepId) {
    updateQuestion(stepId, (question) => ({
      ...question,
      options: [...question.options, createOption(stepId)],
    }));
  }

  function removeOption(stepId: ServiceIntakeStepId, optionId: string) {
    updateQuestion(stepId, (question) => ({
      ...question,
      options: question.options.filter((option) => option.id !== optionId),
    }));
  }

  async function handleSave() {
    if (!config) return;

    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/service-intake-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: config.version,
          questions: config.questions,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to save config");
      }

      setConfig(body.config as ServiceIntakeConfig);
      setSaveMessage("Config updated.");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save config"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveBookingConfig() {
    setBookingSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/site-config/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingConfig),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to save booking config");
      }

      setBookingConfig(body.config as BookingSiteConfig);
      setSaveMessage("Booking config updated.");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save booking config"
      );
    } finally {
      setBookingSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-sm text-muted">Loading intake configuration...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-sm text-red-600">
          {saveError || "Unable to load intake configuration."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <Link
              href="/admin/services"
              className="text-sm text-primary hover:text-accent"
            >
              &larr; Back to Services
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Service Intake Configuration
          </h1>
          <p className="text-sm text-muted">
            Manage the selectable options and prompts used by the intake wizard.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Config"}
        </button>
      </div>

      {(saveMessage || saveError) && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4">
          {saveMessage && <p className="text-sm text-green-700">{saveMessage}</p>}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        </div>
      )}

      <section className="mb-8 rounded-xl border border-border bg-white p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Booking Pricing
            </h2>
            <p className="text-sm text-muted">
              Controls the consultation price shown on public pages and charged
              in Stripe Checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSaveBookingConfig()}
            disabled={bookingSaving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
          >
            {bookingSaving ? "Saving..." : "Save Booking Config"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Consultation Price
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={bookingConfig.consultationPriceCents / 100}
              onChange={(e) =>
                setBookingConfig((current) => ({
                  ...current,
                  consultationPriceCents: Math.round(
                    Number(e.target.value || 0) * 100
                  ),
                }))
              }
              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted">
              Current display: {getBookingPriceLabel(bookingConfig)}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Currency
            </label>
            <select
              value={bookingConfig.consultationCurrency}
              onChange={(e) =>
                setBookingConfig((current) => ({
                  ...current,
                  consultationCurrency: e.target
                    .value as BookingSiteConfig["consultationCurrency"],
                }))
              }
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Duration Minutes
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={bookingConfig.consultationDurationMinutes}
              onChange={(e) =>
                setBookingConfig((current) => ({
                  ...current,
                  consultationDurationMinutes: Math.max(
                    1,
                    Math.round(Number(e.target.value || 1))
                  ),
                }))
              }
              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              CTA Label
            </label>
            <input
              type="text"
              value={bookingConfig.consultationCtaLabel}
              onChange={(e) =>
                setBookingConfig((current) => ({
                  ...current,
                  consultationCtaLabel: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Consultation Description
            </label>
            <textarea
              value={bookingConfig.consultationDescription}
              onChange={(e) =>
                setBookingConfig((current) => ({
                  ...current,
                  consultationDescription: e.target.value,
                }))
              }
              rows={2}
              className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {SERVICE_INTAKE_STEP_ORDER.map((stepId) => {
          const question = config.questions[stepId];
          const activeOptionCount = question.options.filter(
            (option) => option.active
          ).length;

          return (
            <section
              key={stepId}
              className="rounded-xl border border-border bg-white p-6"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {STEP_LABELS[stepId]}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {activeOptionCount} active of {question.options.length} options
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addOption(stepId)}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  Add Option
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Title
                  </label>
                  <input
                    type="text"
                    aria-label={`${STEP_LABELS[stepId]} title`}
                    value={question.title}
                    onChange={(e) =>
                      updateQuestion(stepId, (current) => ({
                        ...current,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Type
                  </label>
                  <select
                    aria-label={`${STEP_LABELS[stepId]} type`}
                    value={question.type}
                    onChange={(e) =>
                      updateQuestion(stepId, (current) => ({
                        ...current,
                        type: e.target.value as ServiceIntakeQuestionConfig["type"],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="single">Single select</option>
                    <option value="multi">Multi select</option>
                    <option value="goal_cards">Goal cards</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Subtitle
                  </label>
                  <textarea
                    aria-label={`${STEP_LABELS[stepId]} subtitle`}
                    value={question.subtitle}
                    onChange={(e) =>
                      updateQuestion(stepId, (current) => ({
                        ...current,
                        subtitle: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(question.allowCustom)}
                    onChange={(e) =>
                      updateQuestion(stepId, (current) => ({
                        ...current,
                        allowCustom: e.target.checked,
                      }))
                    }
                  />
                  Allow custom entries
                </label>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(question.allowDetail)}
                    onChange={(e) =>
                      updateQuestion(stepId, (current) => ({
                        ...current,
                        allowDetail: e.target.checked,
                      }))
                    }
                  />
                  Allow detail text
                </label>

                {question.allowDetail && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground">
                        Detail Label
                      </label>
                      <input
                        type="text"
                        aria-label={`${STEP_LABELS[stepId]} detail label`}
                        value={question.detailLabel || ""}
                        onChange={(e) =>
                          updateQuestion(stepId, (current) => ({
                            ...current,
                            detailLabel: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground">
                        Detail Placeholder
                      </label>
                      <input
                        type="text"
                        aria-label={`${STEP_LABELS[stepId]} detail placeholder`}
                        value={question.detailPlaceholder || ""}
                        onChange={(e) =>
                          updateQuestion(stepId, (current) => ({
                            ...current,
                            detailPlaceholder: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                {question.allowCustom && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground">
                        Custom Input Label
                      </label>
                      <input
                        type="text"
                        aria-label={`${STEP_LABELS[stepId]} custom input label`}
                        value={question.customInputLabel || ""}
                        onChange={(e) =>
                          updateQuestion(stepId, (current) => ({
                            ...current,
                            customInputLabel: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground">
                        Custom Input Placeholder
                      </label>
                      <input
                        type="text"
                        aria-label={`${STEP_LABELS[stepId]} custom input placeholder`}
                        value={question.customInputPlaceholder || ""}
                        onChange={(e) =>
                          updateQuestion(stepId, (current) => ({
                            ...current,
                            customInputPlaceholder: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className="rounded-xl border border-border bg-gray-50 p-4"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {option.label || "New option"}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeOption(stepId, option.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          ID
                        </label>
                        <input
                          type="text"
                          aria-label="Option ID"
                          value={option.id}
                          onChange={(e) =>
                            updateOption(stepId, option.id, (current) => ({
                              ...current,
                              id: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Label
                        </label>
                        <input
                          type="text"
                          aria-label="Option label"
                          value={option.label}
                          onChange={(e) =>
                            updateOption(stepId, option.id, (current) => ({
                              ...current,
                              label: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Description
                        </label>
                        <textarea
                          aria-label="Option description"
                          value={option.description}
                          onChange={(e) =>
                            updateOption(stepId, option.id, (current) => ({
                              ...current,
                              description: e.target.value,
                            }))
                          }
                          rows={2}
                          className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Icon Key
                        </label>
                        <input
                          type="text"
                          aria-label="Option icon key"
                          value={option.iconKey}
                          onChange={(e) =>
                            updateOption(stepId, option.id, (current) => ({
                              ...current,
                              iconKey: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Source
                        </label>
                        <select
                          aria-label="Option source"
                          value={option.source || "admin"}
                          onChange={(e) =>
                            updateOption(stepId, option.id, (current) => ({
                              ...current,
                              source: e.target.value as ServiceIntakeOption["source"],
                            }))
                          }
                          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="system">System</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={option.active}
                          onChange={(e) =>
                            updateOption(stepId, option.id, (current) => ({
                              ...current,
                              active: e.target.checked,
                            }))
                          }
                        />
                        Active
                      </label>

                      {stepId === "goals" && (
                        <>
                          <div>
                            <label className="mb-1.5 block text-sm font-semibold text-foreground">
                              Prompt Label
                            </label>
                            <input
                              type="text"
                              aria-label="Option prompt label"
                              value={option.promptLabel || ""}
                              onChange={(e) =>
                                updateOption(stepId, option.id, (current) => ({
                                  ...current,
                                  promptLabel: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-semibold text-foreground">
                              Placeholder
                            </label>
                            <input
                              type="text"
                              aria-label="Option placeholder"
                              value={option.placeholder || ""}
                              onChange={(e) =>
                                updateOption(stepId, option.id, (current) => ({
                                  ...current,
                                  placeholder: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
