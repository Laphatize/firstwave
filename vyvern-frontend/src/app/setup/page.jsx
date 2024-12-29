"use client";
import { useState } from "react";
import { SignedIn, useUser, useOrganization } from "@clerk/nextjs";
import {
  Building,
  Users,
  Shield,
  Globe,
  Phone,
  Mail,
  Lock,
} from "lucide-react";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
// Input component with dark theme styling
const Input = ({ label, icon, children, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-white">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`
          block w-full rounded-lg
          border border-neutral-800
          bg-neutral-900
          text-white placeholder-neutral-500
          focus:ring-2 focus:ring-red-500 focus:border-transparent
          focus:outline-none
          ${icon ? "pl-10" : "pl-4"} pr-4 py-2 text-sm
          transition duration-200
        `}
      />
      {children}
    </div>
  </div>
);

// Button component with dark theme styling
const Button = ({ children, isLoading, className = "", ...props }) => (
  <button
    {...props}
    disabled={isLoading}
    className={`
      relative flex items-center justify-center
      px-4 py-2 rounded-lg
      bg-red-500 hover:bg-red-600
      text-white font-medium
      transition-colors duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {isLoading && (
      <svg
        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )}
    {children}
  </button>
);

// Add this new component near the top with other components
const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2 text-sm text-neutral-300 cursor-pointer group">
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <div
        className={`
        w-5 h-5 border-2 rounded-md
        border-neutral-600
        transition-all duration-200
        peer-checked:bg-red-500 peer-checked:border-red-500
        group-hover:border-red-400
      `}
      >
        <svg
          className={`
            w-4 h-4 text-white
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            transition-opacity duration-200
            ${checked ? "opacity-100" : "opacity-0"}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>
    <span>{label}</span>
  </label>
);

export default function Setup() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
    securityConcerns: [],
    communicationChannels: [],
    previousIncidents: false,
    regulatoryRequirements: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const securityConcernOptions = [
    "Phishing Attacks",
    "Social Engineering",
    "Data Breaches",
    "Insider Threats",
    "Mobile Security",
    "Remote Work Security",
  ];

  const communicationChannelOptions = [
    "Email",
    "SMS",
    "Voice Calls",
    "Social Media",
    "Internal Chat Systems",
  ];

  const regulatoryOptions = ["GDPR", "HIPAA", "SOC 2", "PCI DSS", "CCPA"];

  const industryOptions = [
    "Technology",
    "Healthcare",
    "Financial Services",
    "Education",
    "Manufacturing",
    "Retail",
    "Government",
    "Non-Profit",
    "Professional Services",
    "Other",
  ];

  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const locationOptions = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "Singapore",
    "India",
    "Brazil",
  ];

  const handleIndustrySelect = (industry) => {
    setFormData({ ...formData, industry });
    setShowIndustryDropdown(false);
  };

  const handleLocationSelect = (location) => {
    setFormData({ ...formData, location });
    setShowLocationDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/setup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            userId: user?.id,
            organizationId: organization?.id,
            name: organization?.name,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to setup organization");
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Something went wrong. Please try again.", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const getGovernmentWarning = () => {
    if (
      formData.industry === "Government" &&
      formData.location &&
      formData.location !== "United States"
    ) {
      return (
        <div className=" text-yellow-400 text-sm flex items-center gap-x-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          At this time, we only support U.S. government organizations
        </div>
      );
    }
    return null;
  };

  return (
    <SignedIn>
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 relative">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(255 0 0 / 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(255 0 0 / 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            animation: "pattern-move 20s linear infinite",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.5) 100%)",
          }}
        />

        <div className="flex flex-col items-center relative z-10 max-w-[1200px] mx-auto">
          <div className="flex gap-6 items-start w-full">
            <div className="w-80 hidden lg:block" />

            <div className="w-full">
              <OrganizationSwitcher
                appearance={{
                  baseTheme: dark,
                }}
              />
              <div className="mt-2 bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-neutral-700 ">
                <h1 className="text-2xl font-bold mb-2 text-center text-white">
                  Welcome to Vyvern{" "}
                  <span className="text-xs text-neutral-400">beta</span>
                </h1>
                <p className="text-white text-center mb-6">
                  Let's understand your organization's security needs
                </p>

                {error && (
                  <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Industry"
                      name="industry"
                      value={formData.industry}
                      onChange={(e) => {
                        setFormData({ ...formData, industry: e.target.value });
                        setShowIndustryDropdown(true);
                      }}
                      onFocus={() => setShowIndustryDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowIndustryDropdown(false), 200);
                      }}
                      required
                      icon={<Building className="w-4 h-4" />}
                    >
                      {showIndustryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg">
                          {industryOptions
                            .filter((option) =>
                              option
                                .toLowerCase()
                                .includes(formData.industry.toLowerCase()),
                            )
                            .map((option) => (
                              <div
                                key={option}
                                className="px-4 py-2 text-sm text-white hover:bg-neutral-700 cursor-pointer"
                                onClick={() => handleIndustrySelect(option)}
                              >
                                {option}
                              </div>
                            ))}
                        </div>
                      )}
                    </Input>

                    <Input
                      label="Organization Size"
                      name="size"
                      type="number"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                      required
                      icon={<Users className="w-4 h-4" />}
                    />
                  </div>

                  <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowLocationDropdown(false), 200);
                    }}
                    required
                    icon={<Globe className="w-4 h-4" />}
                  >
                    {showLocationDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg">
                        {locationOptions
                          .filter((option) =>
                            option
                              .toLowerCase()
                              .includes(formData.location.toLowerCase()),
                          )
                          .map((option) => (
                            <div
                              key={option}
                              className="px-4 py-2 text-sm text-white hover:bg-neutral-700 cursor-pointer"
                              onClick={() => handleLocationSelect(option)}
                            >
                              {option}
                            </div>
                          ))}
                      </div>
                    )}
                  </Input>
                  {getGovernmentWarning()}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Security Concerns
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {securityConcernOptions.map((concern) => (
                        <Checkbox
                          key={concern}
                          label={concern}
                          checked={formData.securityConcerns.includes(concern)}
                          onChange={() =>
                            handleCheckboxChange("securityConcerns", concern)
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Communication Channels Used
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {communicationChannelOptions.map((channel) => (
                        <Checkbox
                          key={channel}
                          label={channel}
                          checked={formData.communicationChannels.includes(
                            channel,
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "communicationChannels",
                              channel,
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Regulatory Requirements
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {regulatoryOptions.map((reg) => (
                        <Checkbox
                          key={reg}
                          label={reg}
                          checked={formData.regulatoryRequirements.includes(
                            reg,
                          )}
                          onChange={() =>
                            handleCheckboxChange("regulatoryRequirements", reg)
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Complete Setup
                  </Button>
                </form>
              </div>
            </div>
            <div className="flex flex-col items-center mt-10">
              <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-neutral-700 w-80 sticky top-4 hidden lg:block">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Need Help?
                </h3>
                <p className="text-neutral-300 text-sm mb-4">
                  Stuck at any point? Our support team is here to help you get
                  started.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">
                      Call us at
                    </div>
                    <a
                      href="tel:+2677383510"
                      className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      +1 267 738 3510
                    </a>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400 mb-1">
                      Email us at
                    </div>
                    <a
                      href="mailto:support@vyvern.com"
                      className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      support@vyvern.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-neutral-700 w-80 sticky top-4 hidden lg:block">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Are you a MSP?
                </h3>

                <p className="text-neutral-300 text-sm mb-4">
                  Copy and paste this code into your Vyvern account to bind this
                  organization.
                </p>
                <div className="relative group">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 text-xs text-neutral-400 group-hover:opacity-0 transition-opacity">
                    <Lock className="w-3 h-3" />
                    Hover to view
                  </div>
                  <div
                    className="block w-full rounded-lg
                    border border-neutral-800
                    bg-neutral-900
                    text-white
                    px-4 py-2 text-sm blur-sm group-hover:blur-0"
                  >
                    LQFSAIODF21
                  </div>
                </div>

              
              </div>
              <div className="mt-4 bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-neutral-700 w-80 sticky top-4 hidden lg:block">
              <p className="text-xs text-neutral-400 mt-2 w-full">
                  DEVELOPER DEBUG PANEL<br></br>
                  {organization?.name}
                  {organization?.id}
                  
                </p>
              </div>

              {/* Government Information Section - Only show if Government is selected */}
              {formData.industry === "Government" && (
                <div className="mt-4 bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-neutral-700 w-80 sticky top-4 hidden lg:block">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Government Information
                  </h3>

                  <p className="text-neutral-300 text-sm mb-4">
                    A representative will be in contact with you shortly to
                    complete the setup.
                  </p>
                </div>
              )}
            </div>
          </div>

          <style jsx global>{`
            @keyframes pattern-move {
              0% {
                background-position: 0 0;
              }
              100% {
                background-position: 40px 40px;
              }
            }
          `}</style>
        </div>
      </div>
    </SignedIn>
  );
}
