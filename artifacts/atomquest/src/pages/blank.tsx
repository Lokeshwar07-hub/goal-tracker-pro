export default function BlankPage({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-4">This section is currently under development.</p>
    </div>
  );
}
