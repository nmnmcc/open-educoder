import { Page, type SelectItem, SelectList, useSelectedIndex } from "../ui/index.js";

export function MenuPage({
  title,
  subtitle,
  items,
  onOpen,
  active,
  footer,
}: {
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly items: ReadonlyArray<SelectItem>;
  readonly onOpen: (item: SelectItem) => void;
  readonly active: boolean;
  readonly footer?: string | undefined;
}) {
  const [selected, setSelected] = useSelectedIndex(items.length, title);

  return (
    <Page title={title} subtitle={subtitle} footer={footer}>
      <SelectList items={items} selected={selected} onSelectedChange={setSelected} onOpen={onOpen} active={active} />
    </Page>
  );
}
