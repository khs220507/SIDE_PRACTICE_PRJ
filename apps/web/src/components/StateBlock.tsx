type StateBlockProps = {
  title: string;
  message: string;
};

export function StateBlock({ title, message }: StateBlockProps) {
  return (
    <section className="state-block" aria-live="polite">
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}

