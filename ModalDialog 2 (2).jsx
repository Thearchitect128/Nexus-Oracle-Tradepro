import React, { useState, useEffect } from 'react';
import { X, Info, Trash2, Settings } from 'lucide-react';

// Main Modal Component
const Modal = ({ isOpen, onClose, children, variant = 'default', size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={onClose}
        aria-label="Close modal"
      />
      
      {/* Modal Container */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`
            pointer-events-auto relative bg-white rounded-2xl shadow-2xl
            transform transition-all duration-300 ease-out
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            ${
              size === 'sm' ? 'w-full max-w-sm' :
              size === 'md' ? 'w-full max-w-md' :
              'w-full max-w-lg'
            }
          `}
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-600 transition-colors z-10 hover:bg-gray-100 rounded-lg"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="p-8 sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

// Info Modal Variant
const InfoModal = ({ isOpen, onClose, title = 'Info', message, icon: IconComponent = Info }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="info" size="sm">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <IconComponent size={32} className="text-blue-600" />
        </div>

        {/* Content */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-base leading-relaxed">{message}</p>
        </div>

        {/* Action */}
        <button
          onClick={onClose}
          className="
            w-full mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700
            text-white font-medium rounded-lg transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
        >
          Got it
        </button>
      </div>
    </Modal>
  );
};

// Confirm Modal Variant (Destructive Action)
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm',
  message,
  isDangerous = false,
  icon: IconComponent = Trash2 
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      onClose();
    }
  };

  const iconBgColor = isDangerous ? 'bg-red-50' : 'bg-yellow-50';
  const iconColor = isDangerous ? 'text-red-600' : 'text-yellow-600';
  const buttonColor = isDangerous
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="confirm" size="sm">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <IconComponent size={32} className={iconColor} />
        </div>

        {/* Content */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-base leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onClose}
            className="
              flex-1 px-6 py-3 border border-gray-300 hover:border-gray-400
              text-gray-700 font-medium rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            "
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`
              flex-1 px-6 py-3 ${buttonColor}
              text-white font-medium rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
          >
            {isConfirming ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Form Modal Variant
const FormModal = ({ isOpen, onClose, onSubmit, title = 'Edit Profile' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
      setFormData({ fullName: '', email: '', bio: '' });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="form" size="md">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center">
            <Settings size={28} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">Update your profile information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="
                w-full px-4 py-3 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                transition-colors duration-200
              "
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="
                w-full px-4 py-3 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                transition-colors duration-200
              "
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="4"
              className="
                w-full px-4 py-3 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                transition-colors duration-200 resize-none
              "
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 px-6 py-3 border border-gray-300 hover:border-gray-400
                text-gray-700 font-medium rounded-lg transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700
                text-white font-medium rounded-lg transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Demo Component
export default function ModalDemo() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);

  const handleFormSubmit = (data) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setLastSubmitted(data);
        resolve();
      }, 500);
    });
  };

  const handleConfirm = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Destructive action confirmed');
        resolve();
      }, 500);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Modal / Dialog</h1>
        <p className="text-lg text-gray-600">
          A reusable, accessible dialog with keyboard navigation, backdrop dismiss, and three usage variants.
        </p>
      </div>

      {/* Demo Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Variant */}
        <div
          onClick={() => setInfoOpen(true)}
          className="
            group cursor-pointer p-8 bg-white rounded-2xl border border-gray-200
            hover:border-blue-300 hover:shadow-lg transition-all duration-300
            hover:scale-105
          "
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <Info size={24} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Info</h3>
          <p className="text-sm text-gray-600">Informational</p>
        </div>

        {/* Confirm Variant */}
        <div
          onClick={() => setConfirmOpen(true)}
          className="
            group cursor-pointer p-8 bg-white rounded-2xl border border-gray-200
            hover:border-red-300 hover:shadow-lg transition-all duration-300
            hover:scale-105
          "
        >
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Confirm</h3>
          <p className="text-sm text-gray-600">Destructive action</p>
        </div>

        {/* Form Variant */}
        <div
          onClick={() => setFormOpen(true)}
          className="
            group cursor-pointer p-8 bg-white rounded-2xl border border-gray-200
            hover:border-purple-300 hover:shadow-lg transition-all duration-300
            hover:scale-105
          "
        >
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <Settings size={24} className="text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Form</h3>
          <p className="text-sm text-gray-600">Edit profile</p>
        </div>
      </div>

      {/* Last Submission Display */}
      {lastSubmitted && (
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-green-50 border border-green-200 rounded-xl">
          <h3 className="font-semibold text-green-900 mb-3">Last Submission</h3>
          <pre className="text-sm text-green-800 overflow-auto">
            {JSON.stringify(lastSubmitted, null, 2)}
          </pre>
        </div>
      )}

      {/* Modals */}
      <InfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Info"
        message="This is an informational modal. It displays important information to the user."
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm"
        message="Are you sure you want to delete this item? This action cannot be undone."
        isDangerous={true}
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        title="Edit Profile"
      />
    </div>
  );
}
