"use client";

import { ORDER_NOTE_MAX } from "@/lib/config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setNote } from "@/store/cartSlice";
import Icon from "@/components/store/Icon";

export default function OrderNote() {
  const dispatch = useAppDispatch();
  const note = useAppSelector((s) => s.cart.note);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
      <div className="flex items-center gap-space-sm mb-space-sm">
        <Icon name="edit_note" className="text-primary" />
        <div>
          <label htmlFor="order-note" className="block font-title-md text-title-md text-on-surface font-bold">
            Order note for Iya&apos;s team
          </label>
          <p id="order-note-hint" className="font-body-sm text-body-sm text-on-surface-variant">
            Tell us how you want your items selected or cut.
          </p>
        </div>
      </div>
      <textarea
        id="order-note"
        rows={3}
        maxLength={ORDER_NOTE_MAX}
        value={note}
        onChange={(e) => dispatch(setNote(e.target.value))}
        aria-describedby="order-note-hint order-note-count"
        placeholder="E.g., please pick firm plantains, slice the bitterleaf fine, or call before arrival."
        className="w-full bg-surface-container-low rounded-lg p-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all resize-y"
      />
      <div id="order-note-count" className="flex justify-end mt-2 font-label-caps text-label-caps text-outline">
        {note.length} / {ORDER_NOTE_MAX}
      </div>
    </div>
  );
}
