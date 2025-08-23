import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import { isApiError } from "../../utils/errors";
import { toast } from "sonner";

const SignInForm = () => {
  const [form, setForm] = useState({ email: "admin@example.com", password: "Example@123" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email) {
      setErrors({ ...errors, email: 'Email is required' });
      return;
    }

    if (!form.password) {
      setErrors({ ...errors, password: 'Password is required' });
      return;
    }


    setLoading(true);

    try {
      await login(form.email, form.password);
    } catch (err: unknown) {
      if (isApiError(err)) {
        const message = err.response?.data?.message || "An error occurred";
        console.log(err.response);
        setErrors({
          email: err.response?.data?.errors?.email?.[0] || " ",
          password: err.response?.data?.errors?.password?.[0] || " ",
        });
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen lg:w-1/2">
      <div className="w-full max-w-md p-6 mx-auto">
        <div className="mt-7">
          <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900/20 dark:border-gray-700/50 sm:p-10">
            <div className="text-center">
              <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
                Sign in to your account
              </h1>
            </div>

            <div className="mt-5">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email"
                      autoComplete="email"
                      error={!!errors.email}
                      hint={errors.email}
                    />
                  </div>
                  <div>
                    <Label>
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      autoComplete="current-password"
                      error={!!errors.password}
                      hint={errors.password}
                      rightIcon={
                        showPassword ? (
                          <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <EyeClosedIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )
                      }
                      onRightIconClick={() => setShowPassword(!showPassword)}
                    />
                  </div>

                  <Button className="w-full" size="sm" disabled={loading} type="submit">
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
