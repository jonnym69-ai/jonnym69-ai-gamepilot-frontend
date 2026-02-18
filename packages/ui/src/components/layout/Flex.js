import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export const Flex = ({ direction = 'row', wrap = 'nowrap', justify = 'start', align = 'stretch', gap = 0, items, self, cinematic = false, className, children, ...props }) => {
    const directionClass = `flex-${direction}`;
    const wrapClass = wrap !== 'nowrap' ? `flex-${wrap}` : '';
    const justifyClass = justify !== 'start' ? `justify-${justify}` : '';
    const alignClass = align !== 'stretch' ? `items-${align}` : '';
    const itemsClass = items ? `items-${items}` : '';
    const selfClass = self ? `self-${self}` : '';
    const gapClass = gap > 0 ? `gap-${gap}` : '';
    const cinematicClass = cinematic ? 'backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 p-6' : '';
    return (_jsx("div", { className: cn('flex', directionClass, wrapClass, justifyClass, alignClass, itemsClass, selfClass, gapClass, cinematicClass, className), ...props, children: children }));
};
