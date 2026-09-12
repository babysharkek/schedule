import ActivityKit
import Foundation
import SwiftUI
import WidgetKit

@available(iOS 16.2, *)
struct ScheduleLiveActivityView: View {
    let context: ActivityViewContext<GenericAttributes>

    private var values: [String: String] { context.state.values }

    private var period: String { values["period"] ?? "–" }
    private var subject: String { values["subject"] ?? "–" }
    private var room: String { values["room"] ?? "" }
    private var teacher: String { values["teacher"] ?? "" }
    private var status: String { values["status"] ?? "now" }

    private var endDate: Date? {
        guard let raw = values["endTime"], let ms = Double(raw) else { return nil }
        return Date(timeIntervalSince1970: ms / 1000)
    }

    private var startDate: Date? {
        guard let raw = values["startTime"], let ms = Double(raw) else { return nil }
        return Date(timeIntervalSince1970: ms / 1000)
    }

    var body: some View {
        HStack(spacing: 12) {
            Text(period)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(Color.accentColor)
                .frame(width: 44, height: 44)
                .background(Color.accentColor.opacity(0.18))
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            VStack(alignment: .leading, spacing: 2) {
                Text(subject)
                    .font(.headline)
                    .lineLimit(1)
                HStack(spacing: 6) {
                    if !room.isEmpty {
                        Label(room, systemImage: "mappin.and.ellipse")
                    }
                    if !teacher.isEmpty {
                        Text(teacher)
                    }
                }
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)
            }

            Spacer(minLength: 4)

            VStack(alignment: .trailing, spacing: 2) {
                Text(statusLabel)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                timerText
                    .font(.system(.headline, design: .rounded))
                    .monospacedDigit()
            }
        }
        .activityBackgroundTint(Color.clear)
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    private var statusLabel: String {
        switch status {
        case "next": return "NEXT"
        case "break": return "BREAK"
        case "done": return "DONE"
        default: return "ENDS"
        }
    }

    @ViewBuilder
    private var timerText: some View {
        if status == "now", let endDate {
            Text(endDate, style: .timer)
                .foregroundStyle(Color.accentColor)
        } else if status == "next", let startDate {
            Text(startDate, style: .timer)
                .foregroundStyle(Color.accentColor)
        } else {
            Text("–")
                .foregroundStyle(.secondary)
        }
    }
}

@available(iOS 16.2, *)
struct ScheduleLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: GenericAttributes.self) { context in
            ScheduleLiveActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(context.state.values["period"] ?? "–")
                            .font(.system(.title3, design: .rounded, weight: .bold))
                        Text(context.state.values["subject"] ?? "–")
                            .font(.headline)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 2) {
                        if let raw = context.state.values["endTime"],
                            let ms = Double(raw)
                        {
                            Text(Date(timeIntervalSince1970: ms / 1000), style: .timer)
                                .font(.system(.headline, design: .rounded))
                                .monospacedDigit()
                        }
                        Text(context.state.values["room"] ?? "")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(subtitle(context))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            } compactLeading: {
                Text(context.state.values["period"] ?? "–")
                    .font(.system(.subheadline, design: .rounded, weight: .bold))
            } compactTrailing: {
                if let raw = context.state.values["endTime"], let ms = Double(raw) {
                    Text(Date(timeIntervalSince1970: ms / 1000), style: .timer)
                        .monospacedDigit()
                } else {
                    Text("•")
                }
            } minimal: {
                Text(context.state.values["period"] ?? "•")
            }
        }
    }

    private func subtitle(_ context: ActivityViewContext<GenericAttributes>) -> String {
        if let room = context.state.values["room"], !room.isEmpty {
            return "\(context.state.values["subject"] ?? "") · \(room)"
        }
        return context.state.values["subject"] ?? ""
    }
}

@available(iOS 16.2, *)
@main
struct SaturnWidgetBundle: WidgetBundle {
    var body: some Widget {
        ScheduleLiveActivity()
    }
}