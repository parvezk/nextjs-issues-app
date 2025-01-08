"use client";

import { useState } from "react";
import { Provider, useQuery, useMutation } from "urql";
import urqlClient from "@/lib/urqlClient";
import "./issues.css";

const ISSUES_QUERY = `
  query IssuesForUser($email: String!) {
    issuesForUser(email: $email) {
      id
      name
      content
      status
    }
  }
`;

const UPDATE_ISSUE_STATUS_MUTATION = `
  mutation UpdateIssueStatus($id: String!, $status: String!) {
    updateIssueStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const HomePage = () => {
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>(
    {}
  );

  const [{ data, fetching, error }] = useQuery({
    query: ISSUES_QUERY,
    variables: { email: "admin@admin.com" },
  });

  const [, updateIssueStatus] = useMutation(UPDATE_ISSUE_STATUS_MUTATION);

  const handleStatusChange = (issueId: string, newStatus: string) => {
    updateIssueStatus(
      { id: issueId, status: newStatus },
      {
        // Optimistically update the cache without refetching
        update: (cache, mutationResult) => {
          if (!mutationResult.data) return;

          const currentData = cache.readQuery({
            query: ISSUES_QUERY,
            variables: { email: "admin@admin.com" },
          });

          if (currentData) {
            const updatedIssues = currentData.issuesForUser.map((issue: any) =>
              issue.id === issueId ? { ...issue, status: newStatus } : issue
            );

            cache.writeQuery({
              query: ISSUES_QUERY,
              variables: { email: "admin@admin.com" },
              data: { issuesForUser: updatedIssues },
            });
          }
        },
      }
    );
  };

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Issues</h2>
      <ol className="issues-list">
        <li>
          <h4>Name</h4>
          <h4>Content</h4>
          <h4>Status</h4>
        </li>
        {data?.issuesForUser.map((issue: any) => (
          <li key={issue.id}>
            <h4>{issue.name}</h4>
            <p>{issue.content || "No content"}</p>
            <div>
              <select
                value={selectedStatus[issue.id] || issue.status}
                onChange={(e) => handleStatusChange(issue.id, e.target.value)}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default function App() {
  return (
    <Provider value={urqlClient}>
      <HomePage />
    </Provider>
  );
}
