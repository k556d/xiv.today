"use client";

import { Combobox } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { FiChevronDown, FiCheck, FiCopy } from "react-icons/fi";
import { createCharacterVerificationChallenge } from "@/app/characters/select/actions/create-character-verification-challenge";
import { verifyCharacter } from "@/app/characters/select/actions/verify-character";
import styles from "./CharacterLookupSearch.module.css";

const messages = {
  codeGenerationFailed: "Failed to generate verification code.",
  lookupFailed: "Lookup failed.",
  noWorldSelected: "Select a home world from the list.",
  verificationFailed: "Verification failed.",
} as const;

type Result = {
  id: string;
  name: string;
  world: string;
  avatarUrl: string | null;
  profileUrl: string;
};

export default function CharacterLookupSearch({
  worlds,
  initialName,
  initialWorld,
  initialResults,
  initialError,
}: {
  worlds: string[];
  initialName: string;
  initialWorld: string;
  initialResults: Result[];
  initialError: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [world, setWorld] = useState(initialWorld);
  const [worldQuery, setWorldQuery] = useState(initialWorld);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [results] = useState<Result[]>(initialResults);
  const [selectedCharacter, setSelectedCharacter] = useState<Result | null>(initialResults[0] ?? null);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: "idle" | "verified" | "failed";
    message: string;
  } | null>(null);

  const filteredWorlds =
    worldQuery === ""
      ? worlds
      : worlds.filter((homeWorld) => homeWorld.toLowerCase().includes(worldQuery.toLowerCase()));

  useEffect(() => {
    let cancelled = false;

    async function generateVerificationChallenge() {
      if (!selectedCharacter) {
        setVerificationCode("");
        setCodeCopied(false);
        setChallengeLoading(false);
        return;
      }

      setChallengeLoading(true);
      setVerificationCode("");
      setCodeCopied(false);

      try {
        const result = await createCharacterVerificationChallenge({ characterId: selectedCharacter.id });
        if ("error" in result) {
          if (!cancelled) {
            setVerificationResult({
              status: "failed",
              message: result.error.message,
            });
          }
          return;
        }

        if (!cancelled) {
          setVerificationCode(result.code);
        }
      } catch {
        if (!cancelled) {
          setVerificationResult({
            status: "failed",
            message: messages.codeGenerationFailed,
          });
        }
      } finally {
        if (!cancelled) {
          setChallengeLoading(false);
        }
      }
    }

    void generateVerificationChallenge();

    return () => {
      cancelled = true;
    };
  }, [selectedCharacter]);

  async function submitVerification(skipProfileCheck: boolean) {
    if (!selectedCharacter?.avatarUrl) {
      return;
    }

    setVerificationLoading(true);
    setVerificationResult(null);

    try {
      const result = await verifyCharacter({
        profileUrl: selectedCharacter.profileUrl,
        characterId: selectedCharacter.id,
        characterName: selectedCharacter.name,
        avatarUrl: selectedCharacter.avatarUrl,
        worldName: selectedCharacter.world,
        skipProfileCheck,
      });

      if ("error" in result) {
        setVerificationResult({
          status: "failed",
          message: result.error.message,
        });
        return;
      }

      setVerificationResult({
        status: "verified",
        message: result.message,
      });

    } catch {
      setVerificationResult({
        status: "failed",
        message: messages.verificationFailed,
      });
    } finally {
      setVerificationLoading(false);
    }
  }

  return (
    <div className={styles.shell}>
      <section className={styles.formCard}>
        <div className={styles.actions}>
          <div>
            <h1 className={styles.title}>Select your character</h1>
            <p className={styles.subtitle}>
              Search Lodestone by character name and home world.
            </p>
          </div>
          <Link href="/" className={styles.backLink}>
            Back home
          </Link>
        </div>

        <form
          action="/characters/select"
          method="get"
          onSubmit={(event) => {
            setError("");

            const selectedWorld = world || worlds.find((candidate) => candidate === worldQuery.trim()) || "";

            if (!selectedWorld) {
              setError(messages.noWorldSelected);
              event.preventDefault();
            } else {
              setWorld(selectedWorld);
              setLoading(true);
            }
          }}
          className={styles.form}
        >
          <input
            value={name}
            name="name"
            onChange={(event) => setName(event.target.value)}
            className={styles.input}
            placeholder="Character name"
            aria-label="Character name"
            required
          />
          <Combobox
            value={world}
            onChange={(selectedWorld) => {
              const nextWorld = selectedWorld ?? "";
              setWorld(nextWorld);
              setWorldQuery(nextWorld);
            }}
          >
            <input name="world" type="hidden" value={world || worldQuery} />
            <div className={styles.combobox}>
              <div className={styles.comboboxField}>
                <Combobox.Input
                  className={styles.input}
                  placeholder="Home world"
                  aria-label="Home world"
                  displayValue={() => worldQuery}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setWorldQuery(nextValue);
                    if (world && world !== nextValue) {
                      setWorld("");
                    }
                  }}
                />
                <Combobox.Button className={styles.comboboxButton} aria-label="Toggle world list">
                  <FiChevronDown aria-hidden="true" />
                </Combobox.Button>
              </div>

              <Combobox.Options className={styles.options}>
                {filteredWorlds.length === 0 ? (
                  <li className={styles.noOptions}>No worlds found.</li>
                ) : (
                  filteredWorlds.map((homeWorld) => (
                    <Combobox.Option key={homeWorld} value={homeWorld} as={Fragment}>
                      {({ active, selected }) => (
                        <li
                          className={[
                            styles.option,
                            active ? styles.optionActive : "",
                            selected ? styles.optionSelected : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <span>{homeWorld}</span>
                          {selected ? <FiCheck aria-hidden="true" className={styles.optionIcon} /> : null}
                        </li>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Combobox>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Looking up…" : "Lookup"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}
      </section>

      {results.length > 0 ? (
        <section className={styles.results} aria-label="Character results">
          {results.map((result) => (
            <article
              key={result.id}
              className={[styles.resultCard, selectedCharacter?.id === result.id ? styles.resultCardSelected : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={styles.resultButton}
                onClick={() => {
                  setSelectedCharacter(result);
                  setCodeCopied(false);
                  setVerificationResult(null);
                }}
              >
                <div className={styles.resultContent}>
                  {result.avatarUrl ? (
                    <Image
                      className={styles.avatar}
                      src={result.avatarUrl}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                    />
                  ) : (
                    <div className={styles.avatar} aria-hidden="true" />
                  )}

                  <div className={styles.resultText}>
                    <p className={styles.resultName}>{result.name}</p>
                    <p className={styles.resultMeta}>{result.world}</p>
                  </div>
                </div>

                {selectedCharacter?.id === result.id ? (
                  <FiCheck aria-hidden="true" className={styles.resultCheckIcon} />
                ) : null}
              </button>
            </article>
          ))}
        </section>
      ) : !error ? (
        <p className={styles.empty}>No results yet.</p>
      ) : null}

      {selectedCharacter ? (
        <section className={styles.validationCard} aria-label="Character validation">
          <div className={styles.validationHeader}>
            <div>
              <h2 className={styles.validationTitle}>Validate character</h2>
              <p className={styles.validationSubtitle}>
                Add this code to the Lodestone profile for {selectedCharacter.name} on {selectedCharacter.world}.
              </p>
            </div>
          </div>

          <div className={styles.codeBox}>
            <div className={styles.codeRow}>
              <code className={styles.code}>{challengeLoading ? "Generating…" : verificationCode}</code>
              <button
                type="button"
                className={styles.copyButton}
                disabled={challengeLoading || !verificationCode || !selectedCharacter.avatarUrl}
                onClick={async () => {
                  if (!verificationCode) {
                    return;
                  }

                  try {
                    await navigator.clipboard.writeText(verificationCode);
                    setCodeCopied(true);
                  } catch {
                    setCodeCopied(false);
                  }
                }}
              >
                <FiCopy aria-hidden="true" className={styles.copyButtonIcon} />
                {codeCopied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <button
            type="button"
            className={styles.verifyButton}
            disabled={verificationLoading || challengeLoading || !verificationCode || !selectedCharacter.avatarUrl}
            onClick={() => {
              void submitVerification(false);
            }}
          >
            {verificationLoading ? "Verifying…" : "Verify"}
          </button>

          <button
            type="button"
            className={styles.skipVerifyButton}
            disabled={verificationLoading || challengeLoading || !verificationCode || !selectedCharacter.avatarUrl}
            onClick={() => {
              void submitVerification(true);
            }}
          >
            {verificationLoading ? "Skipping…" : "Skip verification"}
          </button>

          {verificationResult ? (
            <div>
              <p
                className={[
                  styles.verificationResult,
                  verificationResult.status === "verified" ? styles.verificationResultSuccess : styles.verificationResultFailed,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {verificationResult.message}
              </p>
              {verificationResult.status === "verified" ? (
                <Link href="/settings/login-methods" className={styles.backLink}>
                  Set up login methods
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
