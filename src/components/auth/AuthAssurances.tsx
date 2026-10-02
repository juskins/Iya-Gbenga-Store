import Icon from "@/components/store/Icon";

const ITEMS = [
  {
    icon: "local_shipping",
    tone: "bg-primary-fixed text-primary",
    title: "Chilled Same-Day Fulfillment",
    body: "Leaves, fresh fish and perishables packed in insulated cold-gel cases.",
  },
  {
    icon: "sanitizer",
    tone: "bg-secondary-fixed text-secondary",
    title: "Hand-Sorted & Stone-Free",
    body: "Double winnowed egusi, grit-free crayfish and carefully picked beans.",
  },
  {
    icon: "support_agent",
    tone: "bg-tertiary-fixed text-tertiary",
    title: "Real People Help",
    body: "Talk to our market stall team for custom cuts, portions or bulk orders.",
  },
];

export default function AuthAssurances() {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-xl">
      {ITEMS.map((item) => (
        <li key={item.title} className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm">
          <div className={`p-2.5 rounded-full shrink-0 ${item.tone}`}>
            <Icon name={item.icon} className="text-2xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-on-surface font-bold">{item.title}</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
