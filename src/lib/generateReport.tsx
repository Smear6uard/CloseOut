import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { PRIORITY_COLORS, STATUS_COLORS } from "./constants";
import type { ItemStatus, Priority } from "./constants";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1e293b",
  },
  coverPage: {
    padding: 40,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  coverStats: {
    marginTop: 32,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    width: "80%",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  statValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tradeGroup: {
    marginBottom: 14,
  },
  tradeName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#334155",
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
  },
  itemTitle: {
    flex: 1,
    fontSize: 9,
  },
  itemStatus: {
    width: 70,
    fontSize: 8,
    textAlign: "center",
  },
  itemPriority: {
    width: 60,
    fontSize: 8,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
  },
  signOff: {
    marginTop: 60,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  signOffLine: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    width: 200,
  },
  signOffLabel: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 4,
  },
});

interface ReportItem {
  _id: string;
  title: string;
  status: string;
  priority: string;
  trade: string;
  location?: string;
  assignedTo?: string;
  description?: string;
}

interface ReportData {
  project: {
    name: string;
    address?: string;
  };
  summary: {
    total: number;
    open: number;
    inProgress: number;
    complete: number;
    verified: number;
    completionPercentage: number;
  };
  itemsByTrade: Record<string, ReportItem[]>;
}

function ReportDocument({ data }: { data: ReportData }) {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.title}>{data.project.name}</Text>
        {data.project.address && (
          <Text style={styles.subtitle}>{data.project.address}</Text>
        )}
        <Text style={styles.subtitle}>Punch List Report</Text>
        <Text style={{ ...styles.subtitle, fontSize: 11 }}>
          {generatedDate}
        </Text>

        <View style={styles.coverStats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Items</Text>
            <Text style={styles.statValue}>{data.summary.total}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Open</Text>
            <Text style={styles.statValue}>{data.summary.open}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>In Progress</Text>
            <Text style={styles.statValue}>{data.summary.inProgress}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Complete</Text>
            <Text style={styles.statValue}>{data.summary.complete}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Verified</Text>
            <Text style={styles.statValue}>{data.summary.verified}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Completion</Text>
            <Text style={styles.statValue}>
              {data.summary.completionPercentage}%
            </Text>
          </View>
        </View>
      </Page>

      {/* Items by Trade */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Items by Trade</Text>

        {Object.entries(data.itemsByTrade).map(([trade, items]) => (
          <View key={trade} style={styles.tradeGroup}>
            <Text style={styles.tradeName}>
              {trade} ({items.length})
            </Text>
            {items.map((item) => (
              <View key={item._id} style={styles.itemRow}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text
                  style={{
                    ...styles.itemPriority,
                    color:
                      PRIORITY_COLORS[item.priority as Priority] ?? "#6B7280",
                  }}
                >
                  {item.priority}
                </Text>
                <Text
                  style={{
                    ...styles.itemStatus,
                    color:
                      STATUS_COLORS[item.status as ItemStatus] ?? "#6B7280",
                  }}
                >
                  {item.status.replace("_", " ")}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          Generated by CloseOut on {generatedDate}
        </Text>
      </Page>

      {/* Summary & Sign-off Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Summary</Text>

        <Text style={{ marginBottom: 8 }}>
          This report covers {data.summary.total} punch list items for{" "}
          {data.project.name}.{" "}
          {data.summary.completionPercentage}% of items have been completed or
          verified.
        </Text>

        <View style={styles.signOff}>
          <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>
            Sign-off
          </Text>
          <Text style={{ marginBottom: 20, color: "#64748b" }}>
            I confirm the punch list items in this report have been reviewed.
          </Text>
          <View style={styles.signOffLine} />
          <Text style={styles.signOffLabel}>Signature / Date</Text>
        </View>

        <Text style={styles.footer}>
          Generated by CloseOut on {generatedDate}
        </Text>
      </Page>
    </Document>
  );
}

/**
 * Generates a PDF report for a project and returns it as a Blob.
 * Runs client-side using @react-pdf/renderer.
 *
 * Usage:
 *   const blob = await generateReportPdf(reportData);
 *   const url = URL.createObjectURL(blob);
 *   window.open(url); // or trigger download
 */
export async function generateReportPdf(data: ReportData): Promise<Blob> {
  const blob = await pdf(<ReportDocument data={data} />).toBlob();
  return blob;
}

/**
 * Generates a PDF and triggers a browser download.
 */
export async function downloadReportPdf(data: ReportData): Promise<void> {
  const blob = await generateReportPdf(data);
  const url = URL.createObjectURL(blob);
  const filename = `${data.project.name.replace(/\s+/g, "_")}_PunchList_Report.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
