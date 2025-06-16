const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-4 text-lg font-medium text-gray-700 dark:text-gray-300">
        Chargement...
      </span>
    </div>
  );
};

export default Loading;
