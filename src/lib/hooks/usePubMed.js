"use client";

/**
 * usePubMed — React hook for PubMed evidence lookup
 *
 * Used across Studio, Reels, YouTube, Podcast — any component that needs
 * real PubMed data without managing fetch state manually.
 *
 * Usage:
 *   const { evidence, articles, loading, error, check } = usePubMed();
 *   await check("intermittent fasting diabetes");
 */

import { useState, useCallback } from "react";

export function usePubMed() {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [evidence, setEvidence] = useState(null);   // { score, level, label, articleCount }
  const [articles, setArticles] = useState([]);     // top PubMed articles
  const [query,    setQuery]    = useState(null);

  // Full evidence check (most common usage)
  const check = useCallback(async (searchQuery, options = {}) => {
    if (!searchQuery?.trim()) return;
    setLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const res = await fetch("/api/pubmed", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "evidence", query: searchQuery, options }),
      });

      if (!res.ok) throw new Error(`PubMed API returned ${res.status}`);

      const data = await res.json();
      setEvidence(data.evidence);
      setArticles(data.topArticles ?? []);
      return data;

    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search only — returns raw article list
  const search = useCallback(async (searchQuery, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pubmed", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "search", query: searchQuery, options }),
      });
      const data = await res.json();
      setArticles(data.articles ?? []);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Density score only — lightweight, used for topic scoring
  const getDensity = useCallback(async (keyword) => {
    try {
      const res = await fetch("/api/pubmed", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "density", query: keyword }),
      });
      const data = await res.json();
      return data.score ?? null;
    } catch {
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setEvidence(null);
    setArticles([]);
    setError(null);
    setQuery(null);
  }, []);

  return { evidence, articles, loading, error, query, check, search, getDensity, reset };
}
