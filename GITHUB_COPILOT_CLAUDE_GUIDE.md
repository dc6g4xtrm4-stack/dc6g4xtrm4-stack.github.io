# Using Claude Sonnet 4.5 in GitHub Copilot CLI

This guide explains how to configure and use Anthropic's Claude Sonnet 4.5 model with GitHub Copilot CLI.

## 📋 Prerequisites

Before you can use Claude Sonnet 4.5 with GitHub Copilot CLI, ensure you have:

1. **GitHub Copilot Subscription**: Claude Sonnet 4.5 is available to:
   - Copilot Pro users
   - Copilot Business users
   - Copilot Enterprise users

   > **Note**: Claude Sonnet 4.5 is NOT available on the Individual (free) tier.

2. **Enterprise Users**: If you're part of an organization with GitHub Copilot Enterprise:
   - Your enterprise admin must enable Claude Sonnet 4.5 in the Copilot policy settings
   - Check with your organization's GitHub administrators if you don't see the option

3. **Latest GitHub Copilot CLI**: You need the latest version of the CLI installed

## 🚀 Installation & Setup

### Step 1: Install GitHub CLI and Copilot Extension

First, ensure you have the GitHub CLI (`gh`) installed. If not, install it from:
- **macOS**: `brew install gh`
- **Windows**: `winget install --id GitHub.cli` or download from [cli.github.com](https://cli.github.com/)
- **Linux**: See [GitHub CLI installation docs](https://github.com/cli/cli#installation)

Then install the GitHub Copilot CLI extension:

```bash
gh extension install github/gh-copilot
```

To verify the installation:

```bash
gh copilot --version
```

### Step 2: Authenticate with GitHub

If this is your first time using GitHub CLI:

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account that has a valid Copilot subscription.

## 🎯 Switching to Claude Sonnet 4.5

### Method 1: Using the Model Picker (Recommended)

1. **Open your terminal**

2. **Run the Copilot CLI**:
   ```bash
   gh copilot
   ```

3. **Open the model picker** by typing:
   ```
   /model
   ```

4. **Select Claude Sonnet 4.5** from the list of available models

5. The CLI will now use Claude Sonnet 4.5 for all subsequent requests

> **Note**: You may need to re-select your preferred model when starting a new CLI session. The model preference may not persist across different terminal sessions.

## 💡 Using Claude Sonnet 4.5

Once you've selected Claude Sonnet 4.5, you can use it for various tasks:

### Code Generation

```bash
gh copilot suggest "Create a Python function to sort a list of dictionaries by a specific key"
```

### Code Explanation

```bash
gh copilot explain "What does this code do?" --file path/to/your/file.py
```

### General Coding Assistance

Simply interact with the CLI as usual - all responses will come from Claude Sonnet 4.5:

```bash
gh copilot
> How do I implement a binary search tree in JavaScript?
```

## 🎓 Best Practices

1. **Choose the Right Model for the Task**:
   - Use Claude Sonnet 4.5 for complex reasoning and coding tasks
   - Consider switching to other available models for different types of tasks
   - Experiment with different models to find what works best for your workflow

2. **Provide Clear Context**:
   - Claude Sonnet 4.5 benefits from detailed, well-structured prompts
   - Include relevant code snippets or file paths when asking for help

3. **Use the Interactive Mode**:
   - The interactive mode (`gh copilot`) allows for back-and-forth conversations
   - This is especially useful for iterative development and debugging

## ⚠️ Troubleshooting

### "Claude Sonnet 4.5 not available" Error

**Possible causes:**
- Your subscription doesn't include access to Claude Sonnet 4.5
- Your enterprise admin hasn't enabled it for your organization
- The feature is still rolling out to your account

**Solutions:**
- Verify your subscription tier (must be Pro, Business, or Enterprise)
- Contact your GitHub admin if you're on an enterprise plan
- Try updating the Copilot extension: `gh extension upgrade gh-copilot`
- Wait for the gradual rollout to reach your account

### CLI Not Recognizing /model Command

**Solution:**
- Update to the latest version of GitHub Copilot CLI extension: `gh extension upgrade gh-copilot`
- Use `gh copilot --help` to see available commands for your version

### Authentication Issues

**Solution:**
```bash
# Re-authenticate with GitHub
gh auth logout
gh auth login

# Verify authentication
gh auth status
```

## 📚 Additional Resources

- [GitHub Copilot Official Documentation](https://docs.github.com/en/copilot)
- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot/github-copilot-in-the-cli)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [GitHub Copilot Changelog](https://github.blog/changelog/)

## 🆕 About Claude Sonnet 4.5

Claude Sonnet 4.5 is Anthropic's advanced language model now available through GitHub Copilot. Key features include:

- **Advanced Reasoning**: Designed for complex problem-solving and multi-step tasks
- **Code Generation**: Capable of generating code across multiple programming languages
- **Large Context Window**: Can process and understand larger amounts of code at once
- **Recent Training**: Trained on more recent data compared to earlier models
- **Versatility**: Suitable for various coding tasks from debugging to architecture design

For detailed performance benchmarks and capabilities, refer to [Anthropic's official documentation](https://docs.anthropic.com/).

## 📝 Quick Reference

```bash
# Install GitHub CLI (if needed)
# macOS: brew install gh
# Windows: winget install --id GitHub.cli
# Linux: see https://github.com/cli/cli#installation

# Install Copilot extension
gh extension install github/gh-copilot

# Update Copilot extension
gh extension upgrade gh-copilot

# Authenticate
gh auth login

# Start interactive session
gh copilot

# Switch model (in interactive mode)
/model

# Get code suggestion
gh copilot suggest "your prompt here"

# Explain code
gh copilot explain "question" --file path/to/file

# Check version
gh copilot --version
```

## 💬 Feedback

If you encounter issues or have suggestions for using Claude Sonnet 4.5 with GitHub Copilot CLI, please:

- Report bugs through GitHub's official support channels
- Share feedback in the GitHub Copilot community discussions
- Check the GitHub Blog for the latest updates and announcements

---

**Last Updated**: January 2026

**Author**: Jack Koehler ([@dc6g4xtrm4-stack](https://github.com/dc6g4xtrm4-stack))
