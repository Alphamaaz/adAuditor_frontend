"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAudit, useSubmitPlatformIntake } from "@/hooks/use-audits";
import { getErrorMessage } from "@/lib/api";
import type { AnswerValue, Platform } from "@/lib/audits";
import {
  PLATFORM_LABELS,
  PLATFORM_QUESTIONS,
  type PlatformQuestion,
} from "@/lib/platform-questionnaire";

type AnswersState = Partial<Record<Platform, Record<string, AnswerValue>>>;

const isVisibleQuestion = (
  question: PlatformQuestion,
  platformAnswers: Record<string, AnswerValue>
) => {
  if (!question.showWhen) return true;

  const dependencyValue = platformAnswers[question.showWhen.questionId];

  if (question.showWhen.includes) {
    return (
      Array.isArray(dependencyValue) &&
      dependencyValue.includes(question.showWhen.includes)
    );
  }

  if (question.showWhen.equals) {
    return dependencyValue === question.showWhen.equals;
  }

  return true;
};

export default function PlatformIntakePage() {
  const params = useParams<{ auditId: string }>();
  const auditId = params.auditId;
  const { data: audit, isLoading } = useAudit(auditId);
  const submitIntake = useSubmitPlatformIntake();
  const [answers, setAnswers] = useState<AnswersState>({});
  const [error, setError] = useState("");

  const selectedPlatforms = useMemo(
    () => audit?.selectedPlatforms || [],
    [audit?.selectedPlatforms]
  );

  const setAnswer = (
    platform: Platform,
    questionId: string,
    value: AnswerValue
  ) => {
    setAnswers((current) => ({
      ...current,
      [platform]: {
        ...(current[platform] || {}),
        [questionId]: value,
      },
    }));
  };

  const toggleMultiAnswer = (
    platform: Platform,
    questionId: string,
    option: string
  ) => {
    const currentAnswers = answers[platform] || {};
    const currentValue = currentAnswers[questionId];
    const values = Array.isArray(currentValue) ? currentValue : [];
    const nextValue = values.includes(option)
      ? values.filter((value) => value !== option)
      : [...values, option];

    setAnswer(platform, questionId, nextValue);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await submitIntake.mutateAsync({
        auditId,
        responses: selectedPlatforms.reduce<AnswersState>((payload, platform) => {
          payload[platform] = answers[platform] || {};
          return payload;
        }, {}),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
            Ad Adviser
          </Link>
          <Link
            href="/dashboard/audits/new"
            className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
          >
            Back
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#6b7280]">
            Step 2 of 3
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[#171717]">
            Platform intake
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Answer the platform-specific audit questions before importing data.
            These answers guide the rule engine and the AI recommendation layer.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-lg border border-[#e5ddd0] bg-white p-6 text-sm text-[#6b7280]">
            Loading audit setup...
          </div>
        )}

        {!isLoading && !audit && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Audit setup was not found.
          </div>
        )}

        {audit && (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-lg border border-[#e5ddd0] bg-white p-5">
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className="font-medium text-[#6b7280]">Audit ID</p>
                  <p className="mt-1 break-all text-[#171717]">{audit.id}</p>
                </div>
                <div>
                  <p className="font-medium text-[#6b7280]">Data source</p>
                  <p className="mt-1 text-[#171717]">
                    {audit.dataSource === "OAUTH" ? "OAuth/API" : "Manual upload"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[#6b7280]">Platforms</p>
                  <p className="mt-1 text-[#171717]">
                    {selectedPlatforms.map((platform) => PLATFORM_LABELS[platform]).join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {selectedPlatforms.map((platform) => {
              const platformAnswers = answers[platform] || {};
              const questions = PLATFORM_QUESTIONS[platform].filter((question) =>
                isVisibleQuestion(question, platformAnswers)
              );

              return (
                <section
                  key={platform}
                  className="rounded-lg border border-[#e5ddd0] bg-white p-6"
                >
                  <h2 className="text-lg font-semibold text-[#171717]">
                    {PLATFORM_LABELS[platform]}
                  </h2>
                  <div className="mt-5 space-y-5">
                    {questions.map((question) => (
                      <QuestionField
                        key={question.id}
                        platform={platform}
                        question={question}
                        value={platformAnswers[question.id]}
                        onChange={setAnswer}
                        onToggle={toggleMultiAnswer}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/dashboard"
                className="rounded-md border border-[#d1cac0] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-white"
              >
                Save for later
              </Link>
              <button
                type="submit"
                disabled={submitIntake.isPending}
                className="rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitIntake.isPending ? "Saving..." : "Continue to data import"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function QuestionField({
  platform,
  question,
  value,
  onChange,
  onToggle,
}: {
  platform: Platform;
  question: PlatformQuestion;
  value: AnswerValue | undefined;
  onChange: (platform: Platform, questionId: string, value: AnswerValue) => void;
  onToggle: (platform: Platform, questionId: string, option: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#374151]">
        {question.id}. {question.label}
      </label>

      {question.type === "select" && (
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(platform, question.id, event.target.value)}
          className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
        >
          <option value="">Select an answer</option>
          {question.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {question.type === "multi-select" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {question.options?.map((option) => {
            const active = Array.isArray(value) && value.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(platform, question.id, option)}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  active
                    ? "border-[#1f4d3a] bg-[#eff7f1] text-[#1f4d3a]"
                    : "border-[#d1cac0] bg-white text-[#374151] hover:border-[#1f4d3a]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "number" && (
        <input
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(event) =>
            onChange(
              platform,
              question.id,
              event.target.value === "" ? "" : Number(event.target.value)
            )
          }
          className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
        />
      )}

      {question.type === "text" && (
        <input
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(platform, question.id, event.target.value)}
          placeholder={question.placeholder}
          className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
        />
      )}
    </div>
  );
}
