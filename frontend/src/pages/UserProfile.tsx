import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  department: z.string().optional(),
  experience: z.number().min(0, "Experience cannot be negative"),
  skills: z.string().optional(),
  password: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const UserProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      department: user?.department || "",
      experience: user?.experience || 0,
      skills: user?.skills?.join(", ") || "",
      password: "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const cleanData: any = {
        name: data.name,
        phone: data.phone,
        department: data.department,
        experience: data.experience,
        skills: data.skills ? data.skills.split(",").map((s) => s.trim()) : [],
      };
      if (data.password && data.password.trim().length >= 6) {
        cleanData.password = data.password;
      }
      await updateProfile(cleanData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 border border-[#1e2e4f]/30">
      <div className="flex items-center justify-between pb-6 border-b border-[#1e2e4f]/20 mb-8">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-2xl border-2 border-blue-500/30">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-200">{user.name}</h2>
            <p className="text-sm text-gray-400 capitalize">{user.role.replace("_", " ")}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
        >
          {isEditing ? "View Profile" : "Edit Profile"}
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-4">
            <div>
              <span className="block text-xs text-gray-500 uppercase font-semibold">Email</span>
              <span className="text-gray-300 font-mono text-base">{user.email}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 uppercase font-semibold">Phone</span>
              <span className="text-gray-300 text-base">{user.phone || "Not set"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 uppercase font-semibold">Department</span>
              <span className="text-gray-300 text-base">{user.department || "Not set"}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <span className="block text-xs text-gray-500 uppercase font-semibold">Experience</span>
              <span className="text-gray-300 text-base">
                {user.experience ? `${user.experience} Years` : "Not set"}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 uppercase font-semibold">Skills</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-gray-800 border border-gray-700/50 rounded-lg text-xs text-gray-300 font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No skills listed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                {...register("name")}
                className={`w-full px-4 py-2.5 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                  errors.name ? "border-red-500" : "border-[#1e2e4f]/30"
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                {...register("phone")}
                className="w-full px-4 py-2.5 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Department
              </label>
              <input
                type="text"
                {...register("department")}
                className="w-full px-4 py-2.5 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                {...register("experience", { valueAsNumber: true })}
                className={`w-full px-4 py-2.5 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                  errors.experience ? "border-red-500" : "border-[#1e2e4f]/30"
                }`}
              />
              {errors.experience && (
                <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              {...register("skills")}
              className="w-full px-4 py-2.5 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full px-4 py-2.5 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
            />
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-[#1e2e4f]/20">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-gray-800 text-gray-300 font-semibold rounded-xl text-xs hover:bg-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;
