export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 bg-gray-50">
      <div className="mx-auto w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600">
            {subtitle}
          </p>
        </div>

        <div className="bg-white py-8 px-6 rounded-lg border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}