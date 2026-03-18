type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  actionClassName?: string;
};

export function PageHeader({ eyebrow, title, description, action, actionClassName }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {action ? <div className={`flex items-center gap-3 ${actionClassName ?? ""}`}>{action}</div> : null}
    </div>
  );
}
