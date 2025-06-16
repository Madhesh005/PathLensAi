import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { User } from "lucide-react"

const UserMenu = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none flex items-center space-x-2">
        <Avatar>
          <AvatarImage src={currentUser?.photoURL || undefined} />
          <AvatarFallback>{avatarInitial}</AvatarFallback>
        </Avatar>
        <span className="hidden md:inline-block font-medium">
          {displayName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu