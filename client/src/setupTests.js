// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => {
	const React = require('react');

	const LinkComponent = React.forwardRef(({ to = '#', children, ...rest }, ref) => (
		<a href={typeof to === 'string' ? to : '#'} ref={ref} {...rest}>
			{children}
		</a>
	));

	const RouterShell = ({ children }) => <>{children}</>;

	return {
		__esModule: true,
		Link: LinkComponent,
		NavLink: LinkComponent,
		BrowserRouter: RouterShell,
		MemoryRouter: RouterShell,
		Routes: RouterShell,
		Route: ({ element }) => element ?? null,
		Navigate: ({ to }) => <span data-navigate={to} />, // simple placeholder
		Outlet: () => null,
		useNavigate: () => () => {},
		useParams: () => ({}),
		useLocation: () => ({ pathname: '/' })
	};
}, { virtual: true });

const mockAxios = {
	get: jest.fn(() => Promise.resolve({ data: {} })),
	post: jest.fn(() => Promise.resolve({ data: {} })),
	put: jest.fn(() => Promise.resolve({ data: {} })),
	delete: jest.fn(() => Promise.resolve({ data: {} })),
	create: () => mockAxios
};

jest.mock('axios', () => ({
	__esModule: true,
	default: mockAxios,
	...mockAxios
}), { virtual: true });
