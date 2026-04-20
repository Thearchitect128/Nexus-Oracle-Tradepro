import React from 'react';

type Evaluation = {
  inPhiAttractor?: boolean;
  attractorId?: string;
  lawCompliance?: {
    nearRecursion: boolean;
    irreversible: boolean;
  };
};

type Props = {
  evaluation: Evaluation;
};

function Badge({ children, title }: { children: React.ReactNode; title?: string }) {
  return <span title={title}>{children}</span>;
}

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return <span title={content}>{children}</span>;
}

function Icon({ name }: { name: string }) {
  return <span aria-label={name}>◈</span>;
}

export default function OracleWorkbenchPage({ evaluation }: Props) {
  return (
    <section>
      {evaluation.inPhiAttractor && (
        <Badge title="Law φ-A: In G_φ attractor">
          G_φ Active · {evaluation.attractorId}
        </Badge>
      )}

      {evaluation.lawCompliance && (
        <Tooltip
          content={`Near-recursion: ${evaluation.lawCompliance.nearRecursion ? 'Yes' : 'No'} | Irreversible: ${evaluation.lawCompliance.irreversible ? 'Yes' : 'No'}`}
        >
          <Icon name="phi-law" />
        </Tooltip>
      )}
    </section>
  );
}
