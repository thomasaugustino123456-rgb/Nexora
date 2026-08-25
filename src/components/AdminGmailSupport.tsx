import React, { useState, useEffect } from "react";
import {
  Mail,
  RefreshCw,
  Search,
  ExternalLink,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Inbox,
  LogOut,
  ChevronRight,
  Filter,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  isUnread: boolean;
}

interface AdminGmailSupportProps {
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const AdminGmailSupport: React.FC<AdminGmailSupportProps> = ({ showToast }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return sessionStorage.getItem("nexora_support_gmail_token");
  });
  const [connectedEmail, setConnectedEmail] = useState<string | null>(() => {
    return sessionStorage.getItem("nexora_support_gmail_email");
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "unread">("all");

  const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

  // Connect via Google OAuth popup
  const handleConnectGmail = async () => {
    setIsConnecting(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope(GMAIL_SCOPE);
      provider.setCustomParameters({
        prompt: "select_account",
        login_hint: "nexoraterm1234@gmail.com"
      });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error("Could not retrieve Google OAuth access token.");
      }

      const email = result.user.email || "nexoraterm1234@gmail.com";
      setAccessToken(token);
      setConnectedEmail(email);
      sessionStorage.setItem("nexora_support_gmail_token", token);
      sessionStorage.setItem("nexora_support_gmail_email", email);

      showToast(`Connected support account: ${email}`, "success");
      fetchEmails(token);
    } catch (err: any) {
      console.error("Gmail OAuth Connection Error:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        showToast("Authentication canceled by user", "info");
      } else {
        showToast(err.message || "Failed to authenticate with Google", "error");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccessToken(null);
    setConnectedEmail(null);
    setMessages([]);
    setSelectedMessage(null);
    sessionStorage.removeItem("nexora_support_gmail_token");
    sessionStorage.removeItem("nexora_support_gmail_email");
    showToast("Disconnected support Gmail account", "info");
  };

  // Decode standard base64url message payload parts
  const decodeBase64Url = (str: string) => {
    try {
      const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = atob(base64);
      return decodeURIComponent(escape(decoded));
    } catch {
      try {
        return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
      } catch {
        return "";
      }
    }
  };

  // Extract body content from Gmail payload hierarchy
  const extractMessageBody = (payload: any): string => {
    if (!payload) return "";
    if (payload.body?.data) {
      return decodeBase64Url(payload.body.data);
    }
    if (payload.parts && Array.isArray(payload.parts)) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          return decodeBase64Url(part.body.data);
        }
      }
      for (const part of payload.parts) {
        if (part.mimeType === "text/html" && part.body?.data) {
          return decodeBase64Url(part.body.data);
        }
      }
      for (const part of payload.parts) {
        const nested = extractMessageBody(part);
        if (nested) return nested;
      }
    }
    return "";
  };

  // Fetch email list
  const fetchEmails = async (tokenToUse?: string) => {
    const token = tokenToUse || accessToken;
    if (!token) return;

    setIsLoading(true);
    try {
      let url = "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25";
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        // Token expired
        showToast("Session expired. Please reconnect your Gmail account.", "error");
        handleDisconnect();
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Gmail API error: ${res.statusText}`);
      }

      const data = await res.json();
      const messageList: any[] = data.messages || [];

      if (messageList.length === 0) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      // Fetch individual message details in batches
      const detailsPromises = messageList.slice(0, 20).map(async (msgItem) => {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgItem.id}?format=full`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          if (!detailRes.ok) return null;
          const msgData = await detailRes.json();

          const headers: any[] = msgData.payload?.headers || [];
          const getHeader = (name: string) => {
            const h = headers.find((header: any) => header.name?.toLowerCase() === name.toLowerCase());
            return h ? h.value : "";
          };

          const from = getHeader("From") || "Unknown Sender";
          const to = getHeader("To") || "";
          const subject = getHeader("Subject") || "(No Subject)";
          const date = getHeader("Date") || "";
          const isUnread = Array.isArray(msgData.labelIds) && msgData.labelIds.includes("UNREAD");
          const body = extractMessageBody(msgData.payload) || msgData.snippet || "";

          return {
            id: msgData.id,
            threadId: msgData.threadId,
            snippet: msgData.snippet || "",
            from,
            to,
            subject,
            date,
            body,
            isUnread
          } as EmailMessage;
        } catch (e) {
          console.warn("Failed to fetch detail for message", msgItem.id, e);
          return null;
        }
      });

      const resolved = await Promise.all(detailsPromises);
      const filteredMsgs = resolved.filter((m): m is EmailMessage => m !== null);
      setMessages(filteredMsgs);

      if (filteredMsgs.length > 0 && !selectedMessage) {
        setSelectedMessage(filteredMsgs[0]);
      }
    } catch (err: any) {
      console.error("Error fetching support emails:", err);
      showToast("Unable to load Gmail messages. Check permissions.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchEmails();
    }
  }, [accessToken]);

  const displayedMessages = messages.filter((m) => {
    if (filterType === "unread") return m.isUnread;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Header info bar */}
      <div className="bg-white border border-emerald-100 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-200">
            <Mail size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 uppercase">
                Support Gmail Inbox
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Official Helpdesk
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Live communication link for <span className="font-bold text-slate-800">nexoraterm1234@gmail.com</span>
            </p>
          </div>
        </div>

        {connectedEmail ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-black uppercase text-emerald-700 block">Connected Account</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{connectedEmail}</span>
            </div>
            <button
              onClick={() => fetchEmails()}
              disabled={isLoading}
              className="p-2.5 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border border-emerald-200"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="p-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border border-rose-200"
            >
              <LogOut size={14} />
              <span>Unlink</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectGmail}
            disabled={isConnecting}
            className="p-3.5 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-red-600/20 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Connecting Account...</span>
              </>
            ) : (
              <>
                <Mail size={15} />
                <span>Connect nexoraterm1234@gmail.com</span>
              </>
            )}
          </button>
        )}
      </div>

      {!accessToken ? (
        /* Not Connected Welcome State */
        <div className="bg-white border border-emerald-100/90 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center border border-red-200 mb-4 shadow-sm">
            <Mail size={32} />
          </div>
          <h4 className="text-xl font-black text-slate-900 uppercase">
            Authorize Support Inbox Connection
          </h4>
          <p className="text-sm text-slate-600 max-w-lg mt-2 font-medium">
            Connect your <span className="font-bold text-slate-900">nexoraterm1234@gmail.com</span> support account to view live incoming user tickets, emails, and bug reports without leaving the Nexora command center.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-8 text-left">
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase">
                <CheckCircle2 size={14} />
                <span>Real-Time Sync</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Directly retrieve incoming support messages sent by Nexora operatives.
              </p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase">
                <Shield size={14} />
                <span>Secure OAuth</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Read-only protected access. Tokens are kept in memory and never exposed.
              </p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase">
                <Sparkles size={14} />
                <span>Fast Reply</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Launch one-click replies with prefilled subject lines & recipient email.
              </p>
            </div>
          </div>

          <button
            onClick={handleConnectGmail}
            disabled={isConnecting}
            className="mt-8 py-3.5 px-8 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md shadow-red-600/20 hover:scale-105 active:scale-95 flex items-center gap-2.5"
          >
            <Mail size={16} />
            <span>Connect & Authorize Support Gmail</span>
          </button>
        </div>
      ) : (
        /* Connected Inbox View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Email List Sidebar */}
          <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search emails or sender..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchEmails();
                  }}
                  className="w-full bg-emerald-50/50 border border-emerald-200/80 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      filterType === "all"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-50 text-slate-600 hover:bg-emerald-100"
                    }`}
                  >
                    All ({messages.length})
                  </button>
                  <button
                    onClick={() => setFilterType("unread")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      filterType === "unread"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-50 text-slate-600 hover:bg-emerald-100"
                    }`}
                  >
                    Unread ({messages.filter((m) => m.isUnread).length})
                  </button>
                </div>

                <button
                  onClick={() => fetchEmails()}
                  className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Email list scrollable */}
            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RefreshCw size={20} className="animate-spin text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Syncing Messages...</span>
                </div>
              ) : displayedMessages.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                  <Inbox size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-black uppercase text-slate-600">No Messages Found</p>
                  <p className="text-[11px] text-slate-400 mt-1">Your support inbox currently has no matching emails.</p>
                </div>
              ) : (
                displayedMessages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 shadow-xs"
                          : "bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-black truncate ${msg.isUnread ? "text-slate-900" : "text-slate-700"}`}>
                          {msg.from.split("<")[0].replace(/"/g, "").trim() || msg.from}
                        </span>
                        {msg.isUnread && (
                          <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" title="Unread Message" />
                        )}
                      </div>

                      <h5 className={`text-xs font-bold truncate ${msg.isUnread ? "text-slate-900 font-extrabold" : "text-slate-600"}`}>
                        {msg.subject}
                      </h5>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {msg.snippet}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">
                        <span>{msg.date ? new Date(msg.date).toLocaleDateString() : ""}</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                          View details <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Email Reader / Details Panel */}
          <div className="lg:col-span-7 bg-white border border-emerald-100 rounded-3xl p-6 shadow-xs flex flex-col gap-6 min-h-[500px]">
            {selectedMessage ? (
              <div className="flex flex-col gap-6">
                {/* Header info */}
                <div className="flex flex-col gap-3 border-b border-emerald-100 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedMessage.subject}
                    </h3>
                    <a
                      href={`mailto:${selectedMessage.from}?subject=${encodeURIComponent("Re: " + selectedMessage.subject)}`}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <ExternalLink size={13} />
                      <span>Reply in Email</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/80">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-slate-400 font-mono">From</span>
                      <span className="font-bold text-slate-900 break-all">{selectedMessage.from}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-slate-400 font-mono">Date</span>
                      <span className="font-bold text-slate-700">{selectedMessage.date}</span>
                    </div>
                    {selectedMessage.to && (
                      <div className="flex flex-col sm:col-span-2 mt-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 font-mono">To</span>
                        <span className="font-bold text-slate-700">{selectedMessage.to}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">
                    Message Body
                  </span>
                  <div className="bg-slate-50/80 border border-slate-200/80 p-5 rounded-2xl text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap select-text max-h-[450px] overflow-y-auto">
                    {selectedMessage.body || selectedMessage.snippet || "(Empty message content)"}
                  </div>
                </div>

                {/* Action footer */}
                <div className="pt-2 flex items-center justify-between gap-4 border-t border-emerald-100 text-xs">
                  <span className="text-slate-400 font-mono text-[10px]">
                    Message ID: {selectedMessage.id}
                  </span>
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 hover:underline"
                  >
                    <span>Open full Gmail web inbox</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-24 text-slate-400">
                <Mail size={40} className="text-slate-300 mb-2" />
                <p className="text-xs font-black uppercase text-slate-600">Select an email to view</p>
                <p className="text-[11px] text-slate-400 mt-1">Choose any message from the list on the left to read details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
