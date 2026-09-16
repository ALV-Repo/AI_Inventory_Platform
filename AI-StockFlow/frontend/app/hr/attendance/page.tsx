"use client";

import { useEffect, useMemo, useState } from "react";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave";

type AttendanceRecord = {
  id: string;
  employeeId: string;
  employee: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
};

const initialAttendance: AttendanceRecord[] = [
  {
    id: "ATT-001",
    employeeId: "EMP-001",
    employee: "Rahul Sharma",
    department: "Engineering",
    date: "2026-09-04",
    checkIn: "09:05 AM",
    checkOut: "06:10 PM",
    status: "Present",
  },
  {
    id: "ATT-002",
    employeeId: "EMP-002",
    employee: "Priya Sharma",
    department: "IT",
    date: "2026-09-04",
    checkIn: "09:20 AM",
    checkOut: "06:00 PM",
    status: "Late",
  },
  {
    id: "ATT-003",
    employeeId: "EMP-003",
    employee: "Arjun Rao",
    department: "Sales",
    date: "2026-09-04",
    checkIn: "08:55 AM",
    checkOut: "05:45 PM",
    status: "Present",
  },
  {
    id: "ATT-004",
    employeeId: "EMP-004",
    employee: "Sneha Reddy",
    department: "Warehouse",
    date: "2026-09-04",
    checkIn: "-",
    checkOut: "-",
    status: "Leave",
  },
  {
    id: "ATT-005",
    employeeId: "EMP-005",
    employee: "Vikram Singh",
    department: "Finance",
    date: "2026-09-04",
    checkIn: "-",
    checkOut: "-",
    status: "Absent",
  },
];

function getStatusClasses(status: AttendanceStatus) {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-700";
    case "Absent":
      return "bg-red-100 text-red-700";
    case "Late":
      return "bg-yellow-100 text-yellow-700";
    case "Leave":
      return "bg-blue-100 text-blue-700";
  }
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("stockflow-hr-attendance");

    if (saved) {
      try {
        return JSON.parse(saved) as AttendanceRecord[];
      } catch {
        return initialAttendance;
      }
    }
  }

  return initialAttendance;
});
  const [search, setSearch] = useState("");

  useEffect(() => {
  localStorage.setItem(
    "stockflow-hr-attendance",
    JSON.stringify(records)
  );
}, [records]);

  const [selectedDate, setSelectedDate] = useState("2026-09-04");
  const [statusFilter, setStatusFilter] = useState<"All" | AttendanceStatus>(
    "All"
  );

    const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraStream, setCameraStream] =
    useState<MediaStream | null>(null);

      const [selectedCameraEmployeeId, setSelectedCameraEmployeeId] =
    useState("");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.employee.toLowerCase().includes(search.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        record.department.toLowerCase().includes(search.toLowerCase());

      const matchesDate = record.date === selectedDate;

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [records, search, selectedDate, statusFilter]);

  const summary = useMemo(() => {
    const dailyRecords = records.filter(
      (record) => record.date === selectedDate
    );

    return {
      total: dailyRecords.length,
      present: dailyRecords.filter((r) => r.status === "Present").length,
      absent: dailyRecords.filter((r) => r.status === "Absent").length,
      late: dailyRecords.filter((r) => r.status === "Late").length,
      leave: dailyRecords.filter((r) => r.status === "Leave").length,
    };
  }, [records, selectedDate]);

  const markPresent = (id: string) => {
  setRecords((current) =>
    current.map((record) =>
      record.id === id
        ? {
            ...record,
            status: "Present",
            checkIn:
              record.checkIn === "-"
                ? new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : record.checkIn,
            checkOut: record.checkOut,
          }
        : record
    )
  );
};

  const markAbsent = (id: string) => {
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status: "Absent",
              checkIn: "-",
              checkOut: "-",
            }
          : record
      )
    );
  };

  const markCheckout = (id: string) => {
  setRecords((current) =>
    current.map((record) =>
      record.id === id
        ? {
            ...record,
            checkOut: new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
        : record
    )
  );
};

    const startCamera = async () => {
    setCameraError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera access is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

      setCameraStream(stream);
      setCameraOpen(true);
    } catch {
      setCameraError(
        "Unable to access the camera. Please allow camera permission and try again."
      );
    }
  };

    const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraOpen(false);
  };

  const markCameraAttendance = () => {
    if (!selectedCameraEmployeeId) {
      window.alert("Please select an employee for camera verification.");
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.id === selectedCameraEmployeeId
          ? {
              ...record,
              status: "Present",
              checkIn:
                record.checkIn === "-"
                  ? new Date().toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : record.checkIn,
            }
          : record
      )
    );

    window.alert("Attendance checked in successfully.");

    setSelectedCameraEmployeeId("");
    stopCamera();
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track employee attendance, check-in, check-out and daily status.
            </p>
          </div>

          <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Selected Date</p>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </p>
          </div>
        </div>

                {/* AI CAMERA ATTENDANCE */}
        <section className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-lg">
                  📷
                </span>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    AI Camera Attendance
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Use the device camera for employee attendance check-in.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={startCamera}
              className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1b3152]"
            >
              📷 Start AI Camera
            </button>
          </div>

          {cameraError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {cameraError}
            </div>
          )}
        </section>

        {cameraOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={stopCamera}
          >
            <div
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                    AI Attendance
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    Camera Check-In
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Camera is active and ready for attendance verification.
                  </p>

                  <div className="mt-4">
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
    Select Employee
  </label>

  <select
    value={selectedCameraEmployeeId}
    onChange={(event) =>
      setSelectedCameraEmployeeId(event.target.value)
    }
    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
  >
    <option value="">Select employee for verification</option>

    {records.map((record) => (
      <option key={record.id} value={record.id}>
        {record.employee} — {record.employeeId}
      </option>
    ))}
  </select>
</div>

                </div>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-xl text-slate-400 hover:text-slate-700"
                  aria-label="Close camera"
                >
                  ×
                </button>
              </div>

              <div className="bg-slate-950 p-5">
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={(element) => {
                    if (element && cameraStream) {
                      element.srcObject = cameraStream;
                    }
                  }}
                  className="aspect-video w-full rounded-xl object-cover"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Camera Status
                  </p>

                  <p className="mt-1 text-[11px] text-green-600">
                    ● Camera connected
                  </p>
                </div>

                <div className="flex gap-2">
  <button
    type="button"
    onClick={markCameraAttendance}
    className="rounded-lg bg-green-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-green-700"
  >
    ✓ Verify & Check In
  </button>

  <button
    type="button"
    onClick={stopCamera}
    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100"
  >
    Stop Camera
  </button>
</div>
              </div>
            </div>
          </div>
        )}


        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Employees</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {summary.total}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Present</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {summary.present}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Absent</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {summary.absent}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Late</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {summary.late}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">On Leave</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {summary.leave}
            </p>
          </div>
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search Employee
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID or department..."
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "All" | AttendanceStatus
                  )
                }
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
          </div>
        </section>

        {/* Attendance Table */}
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              Daily Attendance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Employee attendance records for the selected date.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Employee</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Check In</th>
                  <th className="px-5 py-3 font-semibold">Check Out</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {record.employee}
                        </p>
                        <p className="text-xs text-slate-500">
                          {record.employeeId}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {record.department}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {new Date(
                        `${record.date}T00:00:00`
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {record.checkIn}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {record.checkOut}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
  <button
    type="button"
    onClick={() => markPresent(record.id)}
    className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
  >
    Present
  </button>

  <button
    type="button"
    onClick={() => markCheckout(record.id)}
    className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
  >
    Check Out
  </button>

  <button
    type="button"
    onClick={() => markAbsent(record.id)}
    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
  >
    Absent
  </button>
</div>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}