# 📋 **REFACTORING TODOS - RANKED BY URGENCY**

> **Generated:** October 9, 2025  
> **Context:** Post-prompt refactoring analysis  
> **Focus:** Performance, Security, and Maintainability improvements

## 🚨 **CRITICAL PRIORITY (P0) - FIX IMMEDIATELY**

### **TODO #1: Performance Critical - File I/O on Every Request**

- **File:** `app/lib/ai/prompts.ts`
- **Lines:** 10-15
- **Issue:** `readFileSync()` blocks the event loop on every chat message
- **Current Code:**

```typescript
function loadPrompt(filename: string): string {
	try {
		const filePath = join(PROMPTS_DIR, filename);
		return readFileSync(filePath, 'utf-8').trim(); // 🚨 BLOCKS ON EVERY REQUEST!
	} catch (error) {
		console.error(`Failed to load prompt: ${filename}`, error);
		throw new Error(`Failed to load prompt: ${filename}`);
	}
}
```

- **Impact:**
  - Multiple file reads per conversation (5-6 files for sales flow)
  - 50-100ms latency per request under load
  - Vercel function timeouts under concurrent load
- **Urgency:** 🔥 **CRITICAL** - Affects production performance
- **Estimated Fix Time:** 30 minutes
- **Solution:**

```typescript
// Add caching at module level
const PROMPT_CACHE = new Map<string, string>();

function loadPrompt(filename: string): string {
	if (PROMPT_CACHE.has(filename)) {
		return PROMPT_CACHE.get(filename)!;
	}

	try {
		const filePath = join(PROMPTS_DIR, filename);
		const content = readFileSync(filePath, 'utf-8').trim();
		PROMPT_CACHE.set(filename, content);
		return content;
	} catch (error) {
		console.error(`Failed to load prompt: ${filename}`, error);
		throw new Error(`Failed to load prompt: ${filename}`);
	}
}
```

### **TODO #2: Runtime Compatibility - Node.js Only Code**

- **File:** `app/lib/ai/prompts.ts`
- **Lines:** 1, 12
- **Issue:** `readFileSync` from 'fs' module incompatible with Vercel Edge Runtime
- **Current Code:**

```typescript
import { readFileSync } from 'fs'; // 🚨 NODE.JS ONLY!
// ...
return readFileSync(filePath, 'utf-8').trim();
```

- **Impact:**
  - Cannot deploy to Edge Runtime (faster cold starts)
  - Forced to use Node.js runtime (slower, more expensive)
  - Future deployment limitations
- **Urgency:** 🔥 **CRITICAL** - Deployment architecture limitation
- **Estimated Fix Time:** 45 minutes
- **Solution Options:**
  1. **Static imports at build time**
  2. **Bundler plugin to inline prompts**
  3. **Runtime config with environment variables**

---

## ⚠️ **HIGH PRIORITY (P1) - FIX THIS WEEK**

### **TODO #3: Error Handling - Missing Graceful Degradation**

- **File:** `app/lib/ai/prompts.ts`
- **Lines:** 13-16
- **Issue:** If prompt files are missing, entire chat system crashes
- **Current Code:**

```typescript
} catch (error) {
  console.error(`Failed to load prompt: ${filename}`, error);
  throw new Error(`Failed to load prompt: ${filename}`); // 🚨 CRASHES APP!
}
```

- **Impact:**
  - Single missing .txt file breaks all chat functionality
  - No fallback prompts
  - Poor user experience during deployment issues
- **Urgency:** ⚠️ **HIGH** - Reliability issue
- **Estimated Fix Time:** 1 hour
- **Solution:**

```typescript
const DEFAULT_PROMPTS: Record<string, string> = {
	'router.txt':
		'You are a router that detects user intent. Respond with "casual" or "sales".',
	'casual-chat.txt': 'You are a friendly assistant. Be helpful and casual.',
	'sales.txt':
		'You are a sales assistant. Ask questions to understand their needs.',
	'extractor.txt': 'Extract information and return JSON format.',
	'validator.txt': 'Validate the provided data and return validation results.',
};

function loadPrompt(filename: string): string {
	try {
		// ... existing logic
	} catch (error) {
		console.warn(`Using default prompt for ${filename}:`, error.message);
		return (
			DEFAULT_PROMPTS[filename] ||
			'I apologize, but I encountered an error. Please try again.'
		);
	}
}
```

### **TODO #4: Security - Template Injection Vulnerability**

- **File:** `app/lib/ai/prompts.ts`
- **Line:** 27
- **Issue:** Unsafe regex replacement allows potential template injection
- **Current Code:**

```typescript
Object.entries(variables).forEach(([key, value]) => {
	prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value); // 🚨 INJECTION RISK!
});
```

- **Impact:**
  - User input like `{admin_override}` could inject into prompts
  - Potential manipulation of AI behavior
  - Security vulnerability in production
- **Urgency:** ⚠️ **HIGH** - Security concern
- **Estimated Fix Time:** 30 minutes
- **Solution:**

```typescript
function escapeRegex(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadPromptWithVars(
	filename: string,
	variables: Record<string, string>
): string {
	let prompt = loadPrompt(filename);

	Object.entries(variables).forEach(([key, value]) => {
		// Sanitize value to prevent injection
		const sanitizedValue = value.replace(/[{}]/g, '').trim();
		const escapedKey = escapeRegex(key);
		prompt = prompt.replace(
			new RegExp(`\\{${escapedKey}\\}`, 'g'),
			sanitizedValue
		);
	});

	return prompt;
}
```

---

## 📋 **MEDIUM PRIORITY (P2) - FIX THIS MONTH**

### **TODO #5: Performance - Multiple Model Environment Variables**

- **File:** `app/api/chat/route.ts`
- **Lines:** 25, 62, 119, 136, 174
- **Issue:** 5 different environment variables for same models causing configuration complexity
- **Current Code:**

```typescript
model: groq(process.env.GROQ_EXTRACTOR_MODEL || 'llama-3.3-70b-versatile');
model: groq(process.env.GROQ_VALIDATOR_MODEL || 'llama-3.3-70b-versatile');
model: groq(process.env.GROQ_ROUTER_MODEL || 'llama-3.3-70b-versatile');
model: groq(process.env.GROQ_CASUAL_MODEL || 'llama-3.3-70b-versatile');
model: groq(process.env.GROQ_SALES_MODEL || 'llama-3.3-70b-versatile');
```

- **Impact:**
  - Configuration complexity
  - Inconsistent model usage
  - Hard to maintain and update
- **Urgency:** 📋 **MEDIUM** - Maintenance burden
- **Estimated Fix Time:** 2 hours
- **Solution:** Create centralized model configuration

### **TODO #6: Code Quality - Repeated Error Handling Patterns**

- **File:** `app/api/chat/route.ts`
- **Lines:** 38-47, 82-92
- **Issue:** Duplicated JSON parsing and error handling logic across multiple functions
- **Impact:**
  - Code duplication (DRY violation)
  - Maintenance overhead
  - Inconsistent error handling
- **Urgency:** 📋 **MEDIUM** - Code quality
- **Estimated Fix Time:** 1 hour
- **Solution:** Extract utility function for AI response parsing

### **TODO #7: Monitoring - Missing Performance Metrics**

- **Files:** All AI API routes (`app/api/chat/`)
- **Issue:** No performance monitoring for AI calls
- **Impact:**
  - Cannot track response times
  - No alerting on failures
  - Poor observability in production
- **Urgency:** 📋 **MEDIUM** - Operations improvement
- **Estimated Fix Time:** 3 hours
- **Solution:** Add timing logs and metrics collection

---

## 📝 **LOW PRIORITY (P3) - TECHNICAL DEBT**

### **TODO #8: Type Safety - Loose Error Types**

- **File:** `app/lib/ai/prompts.ts`
- **Line:** 14
- **Issue:** Generic `Error` catch without proper typing
- **Impact:**
  - Less informative error messages
  - Harder debugging
  - Poor developer experience
- **Urgency:** 📝 **LOW** - Developer experience
- **Estimated Fix Time:** 30 minutes

### **TODO #9: Documentation - Missing JSDoc for Public Functions**

- **File:** `app/lib/ai/prompts.ts`
- **Lines:** 33-60 (PROMPTS export)
- **Issue:** Public API lacks proper documentation
- **Impact:**
  - Poor developer experience
  - Hard to understand usage patterns
  - Difficult onboarding for new developers
- **Urgency:** 📝 **LOW** - Documentation debt
- **Estimated Fix Time:** 1 hour

### **TODO #10: Testing - No Unit Tests for Prompt System**

- **File:** Missing `app/lib/ai/__tests__/`
- **Issue:** Critical system has no test coverage
- **Impact:**
  - Risky refactoring
  - Potential regression bugs
  - No confidence in changes
- **Urgency:** 📝 **LOW** - Testing debt
- **Estimated Fix Time:** 4 hours

---

## 📊 **SUMMARY BY URGENCY**

| Priority           | Count | Must Fix By       | Total Time | Impact                 |
| ------------------ | ----- | ----------------- | ---------- | ---------------------- |
| **🔥 P0 Critical** | 2     | **Today**         | 1.25 hours | Production Performance |
| **⚠️ P1 High**     | 2     | **This Week**     | 1.5 hours  | Reliability & Security |
| **📋 P2 Medium**   | 3     | **This Month**    | 6 hours    | Maintenance & Quality  |
| **📝 P3 Low**      | 3     | **When Possible** | 5.5 hours  | Technical Debt         |

**Total Estimated Effort:** 14.25 hours  
**Critical Path:** 2.75 hours to eliminate all production risks

## 🎯 **RECOMMENDED ACTION PLAN**

### **Phase 1: Critical Fixes (Today)**

- [ ] **TODO #1:** Implement prompt caching (30 min)
- [ ] **TODO #2:** Add Edge Runtime compatibility (45 min)
- **Goal:** Eliminate performance bottlenecks and deployment issues

### **Phase 2: High Priority (This Week)**

- [ ] **TODO #3:** Add graceful error handling (1 hour)
- [ ] **TODO #4:** Fix template injection vulnerability (30 min)
- **Goal:** Improve reliability and security

### **Phase 3: Medium Priority (This Month)**

- [ ] **TODO #5:** Centralize model configuration (2 hours)
- [ ] **TODO #6:** Extract error handling utilities (1 hour)
- [ ] **TODO #7:** Add performance monitoring (3 hours)
- **Goal:** Improve maintainability and observability

### **Phase 4: Technical Debt (Ongoing)**

- [ ] **TODO #8:** Improve error types (30 min)
- [ ] **TODO #9:** Add comprehensive documentation (1 hour)
- [ ] **TODO #10:** Create unit test suite (4 hours)
- **Goal:** Long-term code health and developer experience

## 📝 **TRACKING**

**Created:** October 9, 2025  
**Last Updated:** October 9, 2025  
**Status:** 🔄 In Progress

### **Completion Checklist:**

- [ ] P0 Critical (2/2)
- [ ] P1 High (2/2)
- [ ] P2 Medium (3/3)
- [ ] P3 Low (3/3)

**Progress:** 0/10 todos completed

---

## 🚀 **SUCCESS METRICS**

### **After P0 Completion:**

- [ ] Chat response time < 500ms consistently
- [ ] Zero file I/O during chat conversations
- [ ] Compatible with Vercel Edge Runtime

### **After P1 Completion:**

- [ ] Zero chat system crashes from missing files
- [ ] No security vulnerabilities in prompt system
- [ ] Graceful degradation under all error conditions

### **After P2 Completion:**

- [ ] Single environment variable for model configuration
- [ ] Consistent error handling across all AI routes
- [ ] Performance monitoring dashboard available

### **After P3 Completion:**

- [ ] 100% test coverage for prompt system
- [ ] Complete API documentation
- [ ] Type-safe error handling throughout

**🎯 Target Completion Date:** November 15, 2025
