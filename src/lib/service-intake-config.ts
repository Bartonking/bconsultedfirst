import { COLLECTIONS, getDb } from "./firebase";
import type {
  ServiceIntakeConfig,
  ServiceIntakeOption,
  ServiceIntakeQuestionConfig,
  ServiceIntakeStepId,
} from "./types";

export const SERVICE_INTAKE_CONFIG_DOC_ID = "default";

export const SERVICE_INTAKE_STEP_ORDER: ServiceIntakeStepId[] = [
  "teamSize",
  "fulfillmentSetup",
  "systems",
  "bottlenecks",
  "goals",
];

const DEFAULT_QUESTIONS: Record<ServiceIntakeStepId, ServiceIntakeQuestionConfig> =
  {
    teamSize: {
      title: "Team size and roles",
      subtitle:
        "Define the structural core of your operation so we can calibrate the audit to your staffing reality.",
      type: "single",
      allowDetail: true,
      detailLabel: "Additional details",
      detailPlaceholder:
        "Tell us how responsibilities are split across the team.",
      options: [
        {
          id: "sole_trader",
          label: "Sole Trader",
          description: "Individual operation with one primary owner.",
          iconKey: "user",
          active: true,
          source: "system",
        },
        {
          id: "small_team",
          label: "Small Team (2-5)",
          description: "Tight-knit group with fluid roles and shared context.",
          iconKey: "users",
          active: true,
          source: "system",
        },
        {
          id: "medium_team",
          label: "Medium Team (6-20)",
          description:
            "Dedicated owners across operations, CX, fulfillment, or merchandising.",
          iconKey: "workflow",
          active: true,
          source: "system",
        },
        {
          id: "large_org",
          label: "Large Organization (20+)",
          description: "Structured teams, layers of review, and cross-functional handoffs.",
          iconKey: "clipboard",
          active: true,
          source: "system",
        },
      ],
    },
    fulfillmentSetup: {
      title: "Fulfillment setup",
      subtitle:
        "Select the fulfillment patterns that best match your order operations.",
      type: "multi",
      allowCustom: true,
      allowDetail: true,
      detailLabel: "Fulfillment notes",
      detailPlaceholder:
        "Call out manual exceptions, SLAs, or coordination gaps.",
      customInputLabel: "Other setup",
      customInputPlaceholder: "Describe another fulfillment model",
      options: [
        {
          id: "in_house",
          label: "In-house warehouse",
          description: "Orders are picked and packed internally.",
          iconKey: "storefront",
          active: true,
          source: "system",
        },
        {
          id: "third_party_logistics",
          label: "3PL partner",
          description: "A third-party fulfillment provider handles shipping.",
          iconKey: "integration",
          active: true,
          source: "system",
        },
        {
          id: "hybrid_fulfillment",
          label: "Hybrid model",
          description: "Split between in-house and external fulfillment.",
          iconKey: "workflow",
          active: true,
          source: "system",
        },
        {
          id: "dropship",
          label: "Dropship vendors",
          description: "Vendors fulfill directly for part of the catalog.",
          iconKey: "shopping_bag",
          active: true,
          source: "system",
        },
        {
          id: "retail_store",
          label: "Retail or store-based shipping",
          description: "Orders may route through store inventory or local locations.",
          iconKey: "map",
          active: true,
          source: "system",
        },
      ],
    },
    systems: {
      title: "Core systems and tools",
      subtitle:
        "Select the primary platforms and workarounds that currently power the business.",
      type: "multi",
      allowCustom: true,
      allowDetail: true,
      detailLabel: "Systems notes",
      detailPlaceholder:
        "Add context on integrations, spreadsheets, or brittle handoffs.",
      customInputLabel: "Other platform",
      customInputPlaceholder: "Specify another system",
      options: [
        {
          id: "shopify_admin",
          label: "Shopify",
          description: "Commerce platform and order management.",
          iconKey: "shopping_bag",
          active: true,
          source: "system",
        },
        {
          id: "erp",
          label: "ERP",
          description: "Enterprise planning, inventory, or finance backbone.",
          iconKey: "clipboard",
          active: true,
          source: "system",
        },
        {
          id: "shipping_platform",
          label: "Shipping platform",
          description: "Carrier rules, labels, and delivery workflows.",
          iconKey: "workflow",
          active: true,
          source: "system",
        },
        {
          id: "support_platform",
          label: "Support platform",
          description: "Customer service workflows and ticket routing.",
          iconKey: "chat",
          active: true,
          source: "system",
        },
        {
          id: "reporting_stack",
          label: "Reporting stack",
          description: "BI dashboards, exports, or analyst-managed reporting.",
          iconKey: "chart",
          active: true,
          source: "system",
        },
        {
          id: "spreadsheets",
          label: "Excel / Sheets",
          description: "Manual data entry and spreadsheet-based coordination.",
          iconKey: "catalog",
          active: true,
          source: "system",
        },
      ],
    },
    bottlenecks: {
      title: "Top operational bottlenecks",
      subtitle:
        "Identify the areas where friction shows up most often so the audit can focus on the highest-value blockers.",
      type: "multi",
      allowCustom: true,
      customInputLabel: "Add custom bottleneck",
      customInputPlaceholder: "Describe a specific friction point...",
      options: [
        {
          id: "inventory_sync_errors",
          label: "Inventory Sync Errors",
          description: "Stock levels drift across systems or channels.",
          iconKey: "clipboard",
          active: true,
          source: "system",
        },
        {
          id: "manual_order_entry",
          label: "Manual Order Entry",
          description: "Orders require repeated manual intervention or cleanup.",
          iconKey: "wrench",
          active: true,
          source: "system",
        },
        {
          id: "warehouse_communication",
          label: "Warehouse Communication",
          description: "Critical shipping updates depend on ad hoc coordination.",
          iconKey: "storefront",
          active: true,
          source: "system",
        },
        {
          id: "shipping_delays",
          label: "Shipping Delays",
          description: "Carrier, SLA, or handoff delays affect customer experience.",
          iconKey: "workflow",
          active: true,
          source: "system",
        },
        {
          id: "reporting_visibility",
          label: "Reporting Visibility",
          description: "The team lacks timely, trusted operational reporting.",
          iconKey: "eye",
          active: true,
          source: "system",
        },
        {
          id: "data_silos",
          label: "Data Silos",
          description: "Operational data is fragmented across tools and people.",
          iconKey: "integration",
          active: true,
          source: "system",
        },
      ],
    },
    goals: {
      title: "Goals for the next 90 days",
      subtitle:
        "Define clear, practical targets for the next quarter so recommendations can align to outcomes.",
      type: "goal_cards",
      allowCustom: true,
      customInputLabel: "Define Custom Objective",
      customInputPlaceholder: "Add another goal area",
      options: [
        {
          id: "efficiency",
          label: "Efficiency",
          description: "Optimizing resource flow and time-to-value.",
          iconKey: "bolt",
          active: true,
          source: "system",
          promptLabel: "Specific target",
          placeholder:
            "Reduce redundant processing by 25% through clearer workflows.",
        },
        {
          id: "growth",
          label: "Growth",
          description: "Expanding footprint and deepening operational capacity.",
          iconKey: "trending_up",
          active: true,
          source: "system",
          promptLabel: "Key performance indicator",
          placeholder: "Specify your primary growth metric...",
        },
        {
          id: "reliability",
          label: "Reliability",
          description: "Improving consistency, accuracy, and execution quality.",
          iconKey: "shield",
          active: true,
          source: "system",
          promptLabel: "Desired improvement",
          placeholder: "State the reliability outcome you need to reach...",
        },
        {
          id: "visibility",
          label: "Visibility",
          description: "Getting faster insight into the operating picture.",
          iconKey: "eye",
          active: true,
          source: "system",
          promptLabel: "Decision-making target",
          placeholder: "What should become easier to see or measure?",
        },
      ],
    },
  };

function cloneConfig(config: ServiceIntakeConfig): ServiceIntakeConfig {
  return JSON.parse(JSON.stringify(config)) as ServiceIntakeConfig;
}

function cleanText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeOption(option: ServiceIntakeOption): ServiceIntakeOption {
  return {
    id: option.id.trim(),
    label: option.label.trim(),
    description: option.description.trim(),
    iconKey: option.iconKey.trim(),
    active: option.active,
    ...(cleanText(option.source) ? { source: option.source } : {}),
    ...(cleanText(option.promptLabel)
      ? { promptLabel: option.promptLabel?.trim() }
      : {}),
    ...(cleanText(option.placeholder)
      ? { placeholder: option.placeholder?.trim() }
      : {}),
  };
}

function normalizeQuestion(
  fallback: ServiceIntakeQuestionConfig,
  incoming?: Partial<ServiceIntakeQuestionConfig>
): ServiceIntakeQuestionConfig {
  const options = incoming?.options
    ? incoming.options.map((option) => normalizeOption(option))
    : fallback.options.map((option) => normalizeOption(option));
  const detailLabel = cleanText(incoming?.detailLabel);
  const detailPlaceholder = cleanText(incoming?.detailPlaceholder);
  const customInputLabel = cleanText(incoming?.customInputLabel);
  const customInputPlaceholder = cleanText(incoming?.customInputPlaceholder);

  return {
    title: cleanText(incoming?.title) || fallback.title,
    subtitle: cleanText(incoming?.subtitle) || fallback.subtitle,
    type: incoming?.type || fallback.type,
    ...(incoming?.allowCustom !== undefined
      ? { allowCustom: incoming.allowCustom }
      : fallback.allowCustom !== undefined
        ? { allowCustom: fallback.allowCustom }
        : {}),
    ...(incoming?.allowDetail !== undefined
      ? { allowDetail: incoming.allowDetail }
      : fallback.allowDetail !== undefined
        ? { allowDetail: fallback.allowDetail }
        : {}),
    ...(detailLabel
      ? { detailLabel }
      : fallback.detailLabel
        ? { detailLabel: fallback.detailLabel }
        : {}),
    ...(detailPlaceholder
      ? { detailPlaceholder }
      : fallback.detailPlaceholder
        ? { detailPlaceholder: fallback.detailPlaceholder }
        : {}),
    ...(customInputLabel
      ? { customInputLabel }
      : fallback.customInputLabel
        ? { customInputLabel: fallback.customInputLabel }
        : {}),
    ...(customInputPlaceholder
      ? { customInputPlaceholder }
      : fallback.customInputPlaceholder
        ? { customInputPlaceholder: fallback.customInputPlaceholder }
        : {}),
    options,
  };
}

export function createDefaultServiceIntakeConfig(): ServiceIntakeConfig {
  return {
    id: SERVICE_INTAKE_CONFIG_DOC_ID,
    version: 1,
    questions: cloneConfig({
      id: SERVICE_INTAKE_CONFIG_DOC_ID,
      version: 1,
      questions: DEFAULT_QUESTIONS,
      updatedAt: "",
    }).questions,
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeServiceIntakeConfig(
  input?: Partial<ServiceIntakeConfig> | null
): ServiceIntakeConfig {
  const fallback = createDefaultServiceIntakeConfig();

  return {
    id: SERVICE_INTAKE_CONFIG_DOC_ID,
    version:
      typeof input?.version === "number" && input.version > 0
        ? input.version
        : fallback.version,
    questions: {
      teamSize: normalizeQuestion(
        fallback.questions.teamSize,
        input?.questions?.teamSize
      ),
      fulfillmentSetup: normalizeQuestion(
        fallback.questions.fulfillmentSetup,
        input?.questions?.fulfillmentSetup
      ),
      systems: normalizeQuestion(
        fallback.questions.systems,
        input?.questions?.systems
      ),
      bottlenecks: normalizeQuestion(
        fallback.questions.bottlenecks,
        input?.questions?.bottlenecks
      ),
      goals: normalizeQuestion(fallback.questions.goals, input?.questions?.goals),
    },
    updatedAt: cleanText(input?.updatedAt) || fallback.updatedAt,
    ...(cleanText(input?.updatedBy) ? { updatedBy: input?.updatedBy?.trim() } : {}),
  };
}

export async function getServiceIntakeConfig(): Promise<ServiceIntakeConfig> {
  const db = getDb();
  const docRef = db
    .collection(COLLECTIONS.serviceIntakeConfigs)
    .doc(SERVICE_INTAKE_CONFIG_DOC_ID);
  const snap = await docRef.get();

  if (!snap.exists) {
    const config = createDefaultServiceIntakeConfig();
    await docRef.set(config);
    return config;
  }

  return normalizeServiceIntakeConfig(snap.data() as Partial<ServiceIntakeConfig>);
}

export async function saveServiceIntakeConfig(
  input: Partial<ServiceIntakeConfig>,
  updatedBy?: string
): Promise<ServiceIntakeConfig> {
  const db = getDb();
  const docRef = db
    .collection(COLLECTIONS.serviceIntakeConfigs)
    .doc(SERVICE_INTAKE_CONFIG_DOC_ID);

  const config = normalizeServiceIntakeConfig({
    ...input,
    updatedAt: new Date().toISOString(),
    updatedBy,
  });

  await docRef.set(config);
  return config;
}
