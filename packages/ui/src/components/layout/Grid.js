import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export const Grid = ({ cols, sm, md, lg, xl, gap = 6, autoFit = false, autoFill = false, cinematic = false, className, children, ...props }) => {
    const getColsClass = (breakpoint, prefix = '') => {
        if (!breakpoint)
            return '';
        return `${prefix}grid-cols-${breakpoint}`;
    };
    const gridClasses = [
        cols && `grid-cols-${cols}`,
        sm && getColsClass(sm, 'sm:'),
        md && getColsClass(md, 'md:'),
        lg && getColsClass(lg, 'lg:'),
        xl && getColsClass(xl, 'xl:'),
        autoFit && 'grid-cols-[fit-content(minmax(250px,1fr))]',
        autoFill && 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]'
    ].filter(Boolean).join(' ');
    const gapClass = `gap-${gap}`;
    const cinematicClass = cinematic ? 'backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 p-6' : '';
    return (_jsx("div", { className: cn('grid', gridClasses, gapClass, cinematicClass, className), ...props, children: children }));
};
