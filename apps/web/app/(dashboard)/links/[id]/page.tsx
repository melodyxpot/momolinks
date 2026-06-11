"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { Card, Spinner, Chip } from "@heroui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CopyButton, PageHeader, QRCodeBlock, StatCard } from "@momolinks/ui";
import type { LinkStats } from "@momolinks/lib";
import { fetcher } from "@/lib/swr";
import Link from "next/link";

interface LinkDetail {
  id: string;
  code: string;
  shortUrl: string;
  targetUrl: string;
  clicks: number;
  uniqueClicks: number;
  enabled: boolean;
  title?: string;
  description?: string;
  createdAt: string;
  expiresAt?: string | null;
}

export default function LinkDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: link } = useSWR<LinkDetail>(id ? `/api/links/${id}` : null, fetcher);
  const { data: stats } = useSWR<LinkStats>(id ? `/api/stats/${id}?days=30` : null, fetcher);

  if (!link || !stats) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const byCountry = Object.entries(stats.byCountry).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const byDevice = Object.entries(stats.byDevice).sort((a, b) => b[1] - a[1]);
  const byReferrer = Object.entries(stats.byReferrer).sort((a, b) => b[1] - a[1]);
  const singleBarSize = stats.byDay.length === 1 ? 24 : undefined;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title={link.title || link.code}
        description={link.targetUrl}
        actions={
          <>
            <CopyButton value={link.shortUrl} />
            <Link href={link.shortUrl} target="_blank">
              Open
            </Link>
          </>
        }
      />

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <code className="text-lg font-medium text-primary">{link.shortUrl}</code>
          <p className="truncate text-sm text-default-500">{link.targetUrl}</p>
          <div className="mt-2 flex gap-2">
            <Chip size="sm" color={link.enabled ? "success" : "default"}>
              {link.enabled ? "Active" : "Disabled"}
            </Chip>
            {link.expiresAt && (
              <Chip size="sm" color="warning">
                Expires {new Date(link.expiresAt).toLocaleDateString()}
              </Chip>
            )}
          </div>
        </div>
        <QRCodeBlock value={link.shortUrl} size={120} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total clicks" value={stats.totalClicks} />
        <StatCard label="Unique clicks" value={stats.uniqueClicks} />
        <StatCard
          label="Top country"
          value={byCountry[0]?.[0] ?? "—"}
          hint={byCountry[0] ? `${byCountry[0][1]} clicks` : undefined}
        />
      </div>

      <Card>
        <h3 className="mb-4 text-base font-semibold">Clicks (last 30 days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byDay} barCategoryGap="20%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: '#111827', fillOpacity: 0.06 }}
                contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: 'none' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Bar
                dataKey="clicks"
                fill="currentColor"
                className="fill-primary"
                radius={[4, 4, 0, 0]}
                barSize={singleBarSize}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BreakdownCard title="By country" rows={byCountry} />
        <BreakdownCard title="By device" rows={byDevice} />
        <BreakdownCard title="Top referrers" rows={byReferrer} />
      </div>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  return (
    <Card>
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-default-500">No data yet</p>
      ) : (
        <ul className="flex flex-col divide-y divide-default-200 text-sm">
          {rows.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between py-2">
              <span className="truncate pr-3 text-default-600">{k || "direct"}</span>
              <span className="tabular-nums text-default-500">{v}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
