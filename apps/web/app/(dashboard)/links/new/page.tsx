"use client";

import {
  Button,
  Calendar,
  Card,
  DateField,
  DatePicker,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { useState, type ComponentPropsWithRef } from "react";
import { CopyButton, PageHeader, QRCodeBlock } from "@momolinks/ui";
import { ApiError, api } from "@/lib/api";
import Link from "next/link";

interface CreateResponse {
  id: string;
  code: string;
  shortUrl: string;
  targetUrl: string;
}

export default function NewLinkPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState<
    ComponentPropsWithRef<typeof DatePicker>["value"]
  >(null);
  const [loading, setLoading] = useState(false);

  function formatExpiresAt(value: typeof expiresAt): string | undefined {
    if (!value) return undefined;
    if (typeof value === "string") return value;

    const maybeDate = value as unknown as {
      toAbsoluteString?: () => string;
      toString: () => string;
    };

    if (typeof maybeDate.toAbsoluteString === "function") {
      return maybeDate.toAbsoluteString();
    }

    return maybeDate.toString();
  }
  const [created, setCreated] = useState<CreateResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const out = await api.post<CreateResponse>("/api/links", {
        targetUrl: targetUrl.trim(),
        customCode: customCode.trim() || undefined,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        expiresAt: formatExpiresAt(expiresAt),
      });
      setCreated(out);
      console.log("Short link created!");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create";
      console.error("Could not create link:", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Create link"
        description="Shorten a long URL and customize how it routes."
      />

      {created ? (
        <Card className="gap-4">
          <p className="text-sm text-default-500">Your short link is ready 🎉</p>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-default-100 px-4 py-3">
            <code className="truncate text-lg font-medium">{created.shortUrl}</code>
            <CopyButton value={created.shortUrl} size="md" />
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <QRCodeBlock value={created.shortUrl} />
            <div className="flex flex-1 flex-col gap-2">
              <Link href={`/links/${created.id}`}>
                <Button
                  variant="primary"
                >
                  View analytics
                </Button>
              </Link>
                <Button
                  onPress={() => {
                    setCreated(null);
                    setTargetUrl("");
                    setCustomCode("");
                    setTitle("");
                    setDescription("");
                    setExpiresAt(null);
                  }}
                >
                  Create another
                </Button>
              </div>
            </div>
          </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField isRequired>
              <Label>Destination URL</Label>
              <Input
                type="url"
                name="url"
                placeholder="https://example.com/very/long/path"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.currentTarget.value)}
              />
            </TextField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField>
                <Label>Custom alias (optional)</Label>
                <Input
                  placeholder="my-promo"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.currentTarget.value)}
                />
              </TextField>
              <TextField aria-label="expiresAt">
                <DatePicker
                  name="expiresAt"
                  value={expiresAt}
                  onChange={setExpiresAt}
                  className="w-full"
                  aria-label="Expires at"
                >
                  <Label>Expires at (optional)</Label>
                  <DateField.Group fullWidth>
                    <DateField.Input>
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                    <DateField.Suffix>
                      <DatePicker.Trigger aria-label="Choose expiration date">
                        <DatePicker.TriggerIndicator />
                      </DatePicker.Trigger>
                    </DateField.Suffix>
                  </DateField.Group>
                  <DatePicker.Popover>
                    <Calendar aria-label="Expiration date">
                      <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                          <Calendar.YearPickerTriggerHeading />
                          <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                      </Calendar.Header>
                      <Calendar.Grid>
                        <Calendar.GridHeader>
                          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                      <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                          {({ year }) => <Calendar.YearPickerCell year={year} />}
                        </Calendar.YearPickerGridBody>
                      </Calendar.YearPickerGrid>
                    </Calendar>
                  </DatePicker.Popover>
                </DatePicker>
              </TextField>
            </div>
            <TextField>
              <Label>Title (optional)</Label>
              <Input
                placeholder="Internal name for this link"
                value={title}
                onChange={e => setTitle(e.currentTarget.value)}
              />
            </TextField>
            <TextField>
              <Label>Description (optional)</Label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                rows={2}
              />
            </TextField>
            <Button type="submit" variant="primary" isPending={loading}>
              Shorten URL
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
